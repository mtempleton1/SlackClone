import { Request, Response } from "express";
import { db } from "@db";
import { threads, threadMessages, type ThreadMessage } from "@db/schema";
import { eq } from "drizzle-orm";

export async function createThread(req: Request, res: Response) {
  try {
    const { parentMessageId, content } = req.body;

    const [thread] = await db.insert(threads)
      .values({ parentMessageId })
      .returning();

    const [message] = await db.insert(threadMessages)
      .values({
        threadId: thread.id,
        content,
        userId: req.user!.id
      })
      .returning();

    res.status(201).json({ thread, message });
  } catch (error) {
    res.status(500).json({ error: "Failed to create thread" });
  }
}

export async function getThread(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);

    const thread = await db.query.threads.findFirst({
      where: eq(threads.id, threadId),
      with: {
        parentMessage: true,
        messages: {
          with: {
            user: true
          }
        }
      }
    });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch thread" });
  }
}

export async function createThreadMessage(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.threadId);
    const { content } = req.body;

    const [message] = await db.insert(threadMessages)
      .values({
        threadId,
        content,
        userId: req.user!.id
      })
      .returning();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to create thread message" });
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

    // Get unique participants
    const uniqueParticipants = Array.from(new Map(
      messages.map(message => [message.user.id, message.user])
    ).values());

    res.json(uniqueParticipants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch thread participants" });
  }
}