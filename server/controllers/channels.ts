import { Request, Response } from "express";
import { db } from "@db";
import { channels, userChannels, userWorkspaces, messages, users } from "@db/schema";
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
    if (!req.params.channelId || isNaN(Number(req.params.channelId))) {
      return res.status(400).json({ error: "Invalid channel ID" });
    }
    
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
    if (!req.params.channelId || isNaN(Number(req.params.channelId))) {
      return res.status(400).json({ error: "Invalid channel ID" });
    }
    const channelId = parseInt(req.params.channelId);
    const { userId } = req.body;

    // Validate IDs
    if (!userId || isNaN(parseInt(userId.toString()))) {
      return res.status(400).json({ error: "Invalid user ID provided" });
    }

    const userIdNum = parseInt(userId.toString());

    // Check if channel exists
    const [channel] = await db.select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Check if target user exists and is workspace member
    const [workspaceMember] = await db.select()
      .from(userWorkspaces)
      .where(and(
        eq(userWorkspaces.workspaceId, channel.workspaceId),
        eq(userWorkspaces.userId, userIdNum)
      ))
      .limit(1);

    if (!workspaceMember) {
      return res.status(404).json({ error: "User not found in workspace" });
    }

    // Check if already a member
    const [existingMember] = await db.select()
      .from(userChannels)
      .where(and(
        eq(userChannels.channelId, channelId),
        eq(userChannels.userId, userIdNum)
      ))
      .limit(1);

    if (existingMember) {
      return res.status(400).json({ error: "User is already a channel member" });
    }

    // Add member to channel
    await db.insert(userChannels)
      .values({
        userId: userIdNum,
        channelId
      });

    res.status(200).json({ message: "Member added successfully" });
  } catch (error) {
    console.error('Error in addChannelMember:', error);
    res.status(500).json({ error: "Failed to add channel member" });
  }
}

export async function removeChannelMember(req: Request, res: Response) {
  try {
    const channelId = parseInt(req.params.channelId);
    const userId = parseInt(req.params.userId);

    if (isNaN(channelId) || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid channel or user ID" });
    }

    // Check if channel exists
    const [channel] = await db.select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Check if user is a member
    const [membership] = await db.select()
      .from(userChannels)
      .where(and(
        eq(userChannels.channelId, channelId),
        eq(userChannels.userId, userId)
      ))
      .limit(1);

    if (!membership) {
      return res.status(404).json({ error: "User is not a channel member" });
    }

    // Remove from channel
    await db.delete(userChannels)
      .where(and(
        eq(userChannels.channelId, channelId),
        eq(userChannels.userId, userId)
      ));

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error('Error in removeChannelMember:', error);
    res.status(500).json({ error: "Failed to remove channel member" });
  }
}