import { Request, Response } from "express";
import { db } from "@db";
import { messages, messageReactions, threads, threadMessages, users } from "@db/schema";
import { and, eq, asc } from "drizzle-orm";

export async function createMessage(req: Request, res: Response) {
  try {
    const { channelId, content } = req.body;

    const [message] = await db.insert(messages)
      .values({
        channelId,
        content,
        userId: req.user?.id || 1, // Fallback to user 1 for now
        timestamp: new Date()
      })
      .returning();

    // Get user information to include in response
    const [user] = await db.select({
      username: users.username,
      displayName: users.displayName,
      profilePicture: users.profilePicture
    })
    .from(users)
    .where(eq(users.id, message.userId))
    .limit(1);

    const enrichedMessage = {
      ...message,
      sender: user?.displayName || "Unknown User",
      avatar: user?.profilePicture || "https://github.com/shadcn.png"
    };

    res.status(201).json(enrichedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: "Failed to create message" });
  }
}

export async function getChannelMessages(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);

    const channelMessages = await db.select({
      ...messages,
      sender: users.displayName,
      avatar: users.profilePicture
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.channelId, channelId))
    .orderBy(asc(messages.timestamp));

    const enrichedMessages = channelMessages.map(msg => ({
      ...msg,
      sender: msg.sender || "Unknown User",
      avatar: msg.avatar || "https://github.com/shadcn.png",
      timestamp: new Date(msg.timestamp).toLocaleTimeString()
    }));

    res.json(enrichedMessages);
  } catch (error) {
    console.error('Error fetching channel messages:', error);
    res.status(500).json({ error: "Failed to fetch channel messages" });
  }
}

export async function getMessage(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);

    const [message] = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch message" });
  }
}

export async function updateMessage(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);
    const { content } = req.body;

    // First check if message exists and user is author
    const [message] = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to update this message" });
    }

    const [updatedMessage] = await db.update(messages)
      .set({ content })
      .where(eq(messages.id, messageId))
      .returning();

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to update message" });
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);

    // First check if message exists and user is author
    const [message] = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to delete this message" });
    }

    // Delete reactions
    await db.delete(messageReactions)
      .where(eq(messageReactions.messageId, messageId));

    // Delete thread messages if this is a parent message
    const thread = await db.query.threads.findFirst({
      where: eq(threads.parentMessageId, messageId)
    });

    if (thread) {
      await db.delete(threadMessages)
        .where(eq(threadMessages.threadId, thread.id));
      await db.delete(threads)
        .where(eq(threads.id, thread.id));
    }

    // Delete the message
    await db.delete(messages)
      .where(eq(messages.id, messageId));

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
}

export async function getMessageReactions(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);

    const reactions = await db.query.messageReactions.findMany({
      where: eq(messageReactions.messageId, messageId),
      with: {
        emoji: true,
        user: true
      }
    });

    res.json(reactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch message reactions" });
  }
}

export async function addMessageReaction(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);
    const { emojiId } = req.body;

    const [reaction] = await db.insert(messageReactions)
      .values({
        messageId,
        emojiId,
        userId: req.user!.id
      })
      .returning();

    res.status(201).json(reaction);
  } catch (error) {
    res.status(500).json({ error: "Failed to add reaction" });
  }
}

export async function removeMessageReaction(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);
    const emojiId = parseInt(req.params.emojiId);

    await db.delete(messageReactions)
      .where(and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.emojiId, emojiId),
        eq(messageReactions.userId, req.user!.id)
      ));

    res.json({ message: "Reaction removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove reaction" });
  }
}