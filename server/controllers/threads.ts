import { Request, Response } from "express";
import { db } from "@db";
import { threads, threadMessages, messages, users } from "@db/schema";
import { eq, asc } from "drizzle-orm";
import type { Thread, ThreadMessage, Message, User } from "@db/schema";

export async function createThread(req: Request, res: Response) {
  try {
    const { parentMessageId, content } = req.body;

    // First create the thread
    const [thread] = await db.insert(threads)
      .values({ parentMessageId })
      .returning();

    // Then create the first message in the thread
    const [message] = await db.insert(threadMessages)
      .values({
        threadId: thread.id,
        content,
        userId: req.user!.id
      })
      .returning();

    res.status(201).json({ thread, message });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: "Failed to create thread" });
  }
}

export async function getThread(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);
    if (isNaN(threadId)) {
      return res.status(400).json({ error: "Invalid thread ID format" });
    }

    // Get the thread and check if it exists
    const thread = await db.select()
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!thread || thread.length === 0) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // Get the parent message with user details
    const parentMessage = await db.select()
      .from(messages)
      .where(eq(messages.id, thread[0].parentMessageId))
      .limit(1);

    // Get thread messages with user details
    const threadMsgs = await db.select({
      id: threadMessages.id,
      content: threadMessages.content,
      userId: threadMessages.userId,
      timestamp: threadMessages.timestamp,
      user: users
    })
    .from(threadMessages)
    .leftJoin(users, eq(threadMessages.userId, users.id))
    .where(eq(threadMessages.threadId, threadId))
    .orderBy(asc(threadMessages.timestamp));

    // Format the response
    const response = {
      id: thread[0].id,
      parentMessage: parentMessage[0],
      messages: threadMsgs.map(msg => ({
        id: msg.id,
        content: msg.content,
        userId: msg.userId,
        user: msg.user,
        timestamp: msg.timestamp?.toISOString() || new Date().toISOString()
      })),
      createdAt: thread[0].createdAt?.toISOString() || new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ error: "Failed to fetch thread" });
  }
}

export async function createThreadMessage(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);
    const { content } = req.body;

    if (isNaN(threadId)) {
      return res.status(400).json({ error: "Invalid thread ID" });
    }

    // Verify thread exists
    const thread = await db.select()
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!thread || thread.length === 0) {
      return res.status(404).json({ error: "Thread not found" });
    }

    const [message] = await db.insert(threadMessages)
      .values({
        threadId,
        content,
        userId: req.user!.id
      })
      .returning();

    res.status(201).json({
      id: message.id,
      content: message.content,
      userId: message.userId,
      timestamp: message.timestamp?.toISOString() || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating thread message:', error);
    res.status(500).json({ error: "Failed to create thread message" });
  }
}

export async function getThreadMessages(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);

    if (isNaN(threadId)) {
      return res.status(400).json({ error: "Invalid thread ID" });
    }

    const messages = await db.select({
      id: threadMessages.id,
      content: threadMessages.content,
      userId: threadMessages.userId,
      timestamp: threadMessages.timestamp,
      user: users
    })
    .from(threadMessages)
    .leftJoin(users, eq(threadMessages.userId, users.id))
    .where(eq(threadMessages.threadId, threadId))
    .orderBy(asc(threadMessages.timestamp));

    const formattedMessages = messages.map(msg => ({
      id: msg.id.toString(),
      content: msg.content,
      userId: msg.userId,
      timestamp: msg.timestamp?.toISOString() || new Date().toISOString()
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    res.status(500).json({ error: "Failed to fetch thread messages" });
  }
}

export async function deleteThreadMessage(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);
    const messageId = parseInt(req.params.messageId);

    if (isNaN(threadId) || isNaN(messageId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const [deletedMessage] = await db.delete(threadMessages)
      .where(eq(threadMessages.id, messageId))
      .returning();

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error('Error deleting thread message:', error);
    res.status(500).json({ error: "Failed to delete thread message" });
  }
}

export async function getThreadParticipants(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);

    if (isNaN(threadId)) {
      return res.status(400).json({ error: "Invalid thread ID" });
    }

    const participants = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      displayName: users.displayName,
      presenceStatus: users.presenceStatus,
      statusMessage: users.statusMessage,
      profilePicture: users.profilePicture
    })
    .from(threadMessages)
    .leftJoin(users, eq(threadMessages.userId, users.id))
    .where(eq(threadMessages.threadId, threadId))
    .groupBy(users.id);

    res.json(participants);
  } catch (error) {
    console.error('Error fetching thread participants:', error);
    res.status(500).json({ error: "Failed to fetch thread participants" });
  }
}