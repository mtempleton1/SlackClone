import { Request, Response } from "express";
import { db } from "@db";
import { channels, messages, userChannels, userWorkspaces, users } from "@db/schema";
import { and, eq } from "drizzle-orm";

export async function createChannel(req: Request, res: Response) {
  try {
    const { workspaceId, name, topic } = req.body;

    // Check if user is a member of the workspace
    const [membership] = await db.select()
      .from(userWorkspaces)
      .where(and(
        eq(userWorkspaces.workspaceId, workspaceId),
        eq(userWorkspaces.userId, req.user!.id)
      ))
      .limit(1);

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this workspace" });
    }

    const [channel] = await db.insert(channels)
      .values({ workspaceId, name, topic })
      .returning();

    // Add creator as channel member
    await db.insert(userChannels)
      .values({ userId: req.user!.id, channelId: channel.id });

    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: "Failed to create channel" });
  }
}

export async function getChannels(req: Request, res: Response) {
  try {
    const workspaceId = req.query.workspaceId as string;
    const baseQuery = db.select().from(channels);

    const allChannels = workspaceId 
      ? await baseQuery.where(eq(channels.workspaceId, parseInt(workspaceId)))
      : await baseQuery;

    res.json(allChannels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch channels" });
  }
}

export async function getChannel(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);
    const [channel] = await db.select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch channel" });
  }
}

export async function updateChannel(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);
    const { name, topic } = req.body;

    const [updatedChannel] = await db.update(channels)
      .set({ name, topic })
      .where(eq(channels.id, channelId))
      .returning();

    if (!updatedChannel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json(updatedChannel);
  } catch (error) {
    res.status(500).json({ error: "Failed to update channel" });
  }
}

export async function deleteChannel(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);

    // Delete all messages in channel first
    await db.delete(messages).where(eq(messages.channelId, channelId));

    // Delete channel memberships
    await db.delete(userChannels).where(eq(userChannels.channelId, channelId));

    // Delete the channel
    const [deletedChannel] = await db.delete(channels)
      .where(eq(channels.id, channelId))
      .returning();

    if (!deletedChannel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json({ message: "Channel deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete channel" });
  }
}

export async function getChannelMembers(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);

    const members = await db.select({
      user: users
    })
    .from(userChannels)
    .where(eq(userChannels.channelId, channelId))
    .innerJoin(users, eq(userChannels.userId, users.id));

    res.json(members.map(m => m.user));
  } catch (error) {
    console.error('Error in getChannelMembers:', error);
    res.status(500).json({ error: "Failed to fetch channel members" });
  }
}

export async function addChannelMember(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);
    const { userId } = req.body;

    await db.insert(userChannels)
      .values({ userId, channelId });

    res.json({ message: "Member added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add member to channel" });
  }
}

export async function removeChannelMember(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);
    const userId = parseInt(req.params.userId);

    await db.delete(userChannels)
      .where(and(
        eq(userChannels.channelId, channelId),
        eq(userChannels.userId, userId)
      ));

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove member from channel" });
  }
}