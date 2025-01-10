import { Request, Response } from "express";
import { db } from "@db";
import { emojis, messageReactions } from "@db/schema";
import { eq } from "drizzle-orm";

export async function getEmojis(req: Request, res: Response) {
  try {
    const allEmojis = await db.select().from(emojis);
    res.json(allEmojis);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emojis" });
  }
}

export async function createEmoji(req: Request, res: Response) {
  try {
    const { code } = req.body;

    // Check if emoji code already exists
    const [existingEmoji] = await db.select()
      .from(emojis)
      .where(eq(emojis.code, code))
      .limit(1);

    if (existingEmoji) {
      return res.status(400).json({ error: "Emoji code already exists" });
    }

    const [newEmoji] = await db.insert(emojis)
      .values({ code })
      .returning();

    res.status(201).json(newEmoji);
  } catch (error) {
    res.status(500).json({ error: "Failed to create emoji" });
  }
}

export async function deleteEmoji(req: Request, res: Response) {
  try {
    const emojiId = parseInt(req.params.emojiId);

    // Delete all reactions using this emoji
    await db.delete(messageReactions)
      .where(eq(messageReactions.emojiId, emojiId));

    // Delete the emoji
    const [deletedEmoji] = await db.delete(emojis)
      .where(eq(emojis.id, emojiId))
      .returning();

    if (!deletedEmoji) {
      return res.status(404).json({ error: "Emoji not found" });
    }

    res.json({ message: "Emoji deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete emoji" });
  }
}

export async function getEmoji(req: Request, res: Response) {
  try {
    const emojiId = parseInt(req.params.emojiId);
    
    const [emoji] = await db.select()
      .from(emojis)
      .where(eq(emojis.id, emojiId))
      .limit(1);

    if (!emoji) {
      return res.status(404).json({ error: "Emoji not found" });
    }

    // Get usage statistics
    const reactions = await db.select()
      .from(messageReactions)
      .where(eq(messageReactions.emojiId, emojiId));

    res.json({
      ...emoji,
      usageCount: reactions.length
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emoji" });
  }
}
