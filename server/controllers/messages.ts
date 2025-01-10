import { Request, Response } from "express";
import { db } from "@db";
import { messages, users } from "@db/schema";
import { and, eq, asc } from "drizzle-orm";

export async function createMessage(req: Request, res: Response) {
  try {
    console.log('Creating message with data:', req.body); // Debug log

    const { channelId, content } = req.body;
    if (!channelId || !content) {
      console.error('Missing required fields:', { channelId, content });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert the message
    const [message] = await db.insert(messages)
      .values({
        channelId,
        content,
        userId: req.user?.id || 1, // Fallback to user 1 for now
        timestamp: new Date()
      })
      .returning();

    console.log('Message inserted:', message); // Debug log

    // Get user information to include in response
    const [user] = await db.select({
      username: users.username,
      displayName: users.displayName,
      profilePicture: users.profilePicture
    })
    .from(users)
    .where(eq(users.id, message.userId))
    .limit(1);

    console.log('User fetched:', user); // Debug log

    const enrichedMessage = {
      ...message,
      sender: user?.displayName || "Unknown User",
      avatar: user?.profilePicture || "https://github.com/shadcn.png",
      timestamp: message.timestamp.toLocaleTimeString()
    };

    console.log('Sending enriched message:', enrichedMessage); // Debug log
    res.status(201).json(enrichedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: "Failed to create message" });
  }
}

export async function getChannelMessages(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);
    console.log('Fetching messages for channel:', channelId); // Debug log

    const channelMessages = await db.select({
      id: messages.id,
      content: messages.content,
      timestamp: messages.timestamp,
      channelId: messages.channelId,
      userId: messages.userId,
      sender: users.displayName,
      avatar: users.profilePicture
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.channelId, channelId))
    .orderBy(asc(messages.timestamp));

    console.log('Found messages:', channelMessages); // Debug log

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

    const [message] = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.userId !== req.user?.id) {
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

    if (message.userId !== req.user?.id) {
      return res.status(403).json({ error: "Not authorized to delete this message" });
    }

    await db.delete(messages)
      .where(eq(messages.id, messageId));

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
}