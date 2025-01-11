import { Request, Response } from "express";
import { db } from "@db";
import { threads, threadMessages, messages, users } from "@db/schema";
import { eq } from "drizzle-orm";

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
    const messageId = parseInt(req.params.threadId);

    // First get the parent message
    const parentMessage = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
      with: {
        user: true
      }
    });

    if (!parentMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Look for an existing thread or create one
    let thread = await db.query.threads.findFirst({
      where: eq(threads.parentMessageId, messageId),
    });

    if (!thread) {
      const [newThread] = await db.insert(threads)
        .values({ parentMessageId: messageId })
        .returning();
      thread = newThread;
    }

    // Format the response
    const response = {
      id: thread.id,
      parentMessage: {
        id: parentMessage.id.toString(),
        content: parentMessage.content,
        userId: parentMessage.userId,
        timestamp: parentMessage.timestamp.toISOString()
      },
      createdAt: thread.createdAt.toISOString()
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

    // Verify thread exists
    const thread = await db.query.threads.findFirst({
      where: eq(threads.id, threadId)
    });

    if (!thread) {
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
      id: message.id.toString(),
      content: message.content,
      userId: message.userId,
      timestamp: message.timestamp.toISOString()
    });
  } catch (error) {
    console.error('Error creating thread message:', error);
    res.status(500).json({ error: "Failed to create thread message" });
  }
}

export async function getThreadMessages(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);

    const messages = await db.query.threadMessages.findMany({
      where: eq(threadMessages.threadId, threadId),
      with: {
        user: true
      },
      orderBy: threadMessages.timestamp
    });

    const formattedMessages = messages.map(message => ({
      id: message.id.toString(),
      content: message.content,
      userId: message.userId,
      timestamp: message.timestamp.toISOString()
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

    const [deletedMessage] = await db.delete(threadMessages)
      .where(eq(threadMessages.id, messageId))
      .returning();

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete thread message" });
  }
}

export async function getThreadParticipants(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);

    const messages = await db.query.threadMessages.findMany({
      where: eq(threadMessages.threadId, threadId),
      with: {
        user: true
      }
    });

    // Get unique participants using Set
    const uniqueParticipantIds = new Set();
    const uniqueParticipants = messages
      .filter(message => {
        if (uniqueParticipantIds.has(message.user.id)) {
          return false;
        }
        uniqueParticipantIds.add(message.user.id);
        return true;
      })
      .map(message => message.user);

    res.json(uniqueParticipants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch thread participants" });
  }
}