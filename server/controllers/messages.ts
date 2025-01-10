import { Request, Response } from "express";
import { db } from "@db";
import { messages, messageReactions, threads, threadMessages } from "@db/schema";
import { and, eq } from "drizzle-orm";

export async function createMessage(req: Request, res: Response) {
  try {
    const { channelId, content } = req.body;

    const [message] = await db.insert(messages)
      .values({
        channelId,
        content,
        userId: req.user!.id
      })
      .returning();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to create message" });
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

    const [updatedMessage] = await db.update(messages)
      .set({ content })
      .where(and(
        eq(messages.id, messageId),
        eq(messages.userId, req.user!.id)
      ))
      .returning();

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found or unauthorized" });
    }

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to update message" });
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const messageId = parseInt(req.params.messageId);

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
    const [deletedMessage] = await db.delete(messages)
      .where(and(
        eq(messages.id, messageId),
        eq(messages.userId, req.user!.id)
      ))
      .returning();

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found or unauthorized" });
    }

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
