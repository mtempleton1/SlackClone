import { Request, Response } from "express";
import { db } from "@db";
import { messages, messageReactions, emojis, users } from "@db/schema";
import { and, eq, asc, isNull } from "drizzle-orm";

export async function createMessage(req: Request, res: Response) {
  try {
    const { channelId, content, parentId } = req.body;

    // Validate required fields
    if (!channelId || channelId <= 0 || !content) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    // If parentId is provided, verify parent message exists
    if (parentId) {
      const [parentMessage] = await db.select()
        .from(messages)
        .where(eq(messages.id, parentId))
        .limit(1);

      if (!parentMessage) {
        return res.status(404).json({ error: "Parent message not found" });
      }
    }

    const [message] = await db.insert(messages)
      .values({
        channelId: Number(channelId),
        content,
        userId: req.user!.id,
        parentId: parentId ? Number(parentId) : null
      })
      .returning();

    res.status(201).json({
      id: message.id,
      content: message.content,
      userId: message.userId,
      channelId: message.channelId,
      parentId: message.parentId,
      timestamp: message.timestamp?.toISOString() || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: "Failed to create message" });
  }
}

export async function getChannelMessages(req: Request, res: Response) {
  try {
    const channelId = Number(req.params.channelId);

    if (isNaN(channelId) || channelId <= 0) {
      return res.status(400).json({ error: "Invalid channel ID" });
    }

    // Query only top-level messages (not thread replies)
    const channelMessages = await db.select({
      id: messages.id,
      content: messages.content,
      userId: messages.userId,
      channelId: messages.channelId,
      parentId: messages.parentId,
      timestamp: messages.timestamp,
      user: users
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(and(
      eq(messages.channelId, channelId),
      isNull(messages.parentId)  // Only get top-level messages
    ))
    .orderBy(asc(messages.id));

    const formattedMessages = channelMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      userId: msg.userId,
      channelId: msg.channelId,
      parentId: msg.parentId,
      timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
      user: msg.user
    }));

    res.json(formattedMessages);
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

    // Delete thread messages (replies) if this is a parent message
    if (!message.parentId) {
      await db.delete(messages)
        .where(eq(messages.parentId, messageId));
    }

    // Delete the message itself
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

    const reactions = await db.select({
      id: messageReactions.id,
      userId: messageReactions.userId,
      emoji: emojis
    })
    .from(messageReactions)
    .leftJoin(emojis, eq(messageReactions.emojiId, emojis.id))
    .where(eq(messageReactions.messageId, messageId));

    res.json(reactions);
  } catch (error) {
    console.error('Error fetching message reactions:', error);
    res.status(500).json({ error: "Failed to fetch message reactions" });
  }
}

export async function addMessageReaction(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);
    const { emojiCode } = req.body;

    // First, get or create the emoji
    let [emoji] = await db.select()
      .from(emojis)
      .where(eq(emojis.code, emojiCode))
      .limit(1);

    if (!emoji) {
      [emoji] = await db.insert(emojis)
        .values({ code: emojiCode })
        .returning();
    }

    // Then create the reaction
    const [reaction] = await db.insert(messageReactions)
      .values({
        messageId,
        emojiId: emoji.id,
        userId: req.user!.id
      })
      .returning();

    res.status(201).json({ ...reaction, emoji });
  } catch (error) {
    console.error('Error adding reaction:', error);
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

// New thread-related functions that work with parentId
export async function getThreadMessages(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);

    // Get the parent message and all its replies
    const threadMessages = await db.select({
      id: messages.id,
      content: messages.content,
      userId: messages.userId,
      channelId: messages.channelId,
      parentId: messages.parentId,
      timestamp: messages.timestamp,
      user: users
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(and(
      eq(messages.parentId, messageId)
    ))
    .orderBy(asc(messages.timestamp));

    res.json(threadMessages);
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    res.status(500).json({ error: "Failed to fetch thread messages" });
  }
}

export async function createThreadMessage(req: Request, res: Response) {
  try {
    const parentId = parseInt(req.params.messageId);
    const { content } = req.body;

    // Verify parent message exists
    const [parentMessage] = await db.select()
      .from(messages)
      .where(eq(messages.id, parentId))
      .limit(1);

    if (!parentMessage) {
      return res.status(404).json({ error: "Parent message not found" });
    }

    // Create the thread message
    const [threadMessage] = await db.insert(messages)
      .values({
        content,
        userId: req.user!.id,
        channelId: parentMessage.channelId,
        parentId
      })
      .returning();

    res.status(201).json(threadMessage);
  } catch (error) {
    console.error('Error creating thread message:', error);
    res.status(500).json({ error: "Failed to create thread message" });
  }
}