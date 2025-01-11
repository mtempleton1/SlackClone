import { Request, Response } from "express";
import { db } from "@db";
import { workspaces, channels, userWorkspaces, users } from "@db/schema";
import { and, eq } from "drizzle-orm";
import "../types";

export async function createWorkspace(req: Request, res: Response) {
  try {
    const { name, description, organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }

    const [workspace] = await db.insert(workspaces)
      .values({ name, description, organizationId })
      .returning();

    // Add creator as workspace member
    await db.insert(userWorkspaces)
      .values({ userId: req.user!.id, workspaceId: workspace.id });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: "Failed to create workspace" });
  }
}

export async function getWorkspaces(req: Request, res: Response) {
  try {
    const userWorkspacesList = await db
      .select({
        workspace: workspaces
      })
      .from(userWorkspaces)
      .where(eq(userWorkspaces.userId, req.user!.id))
      .innerJoin(workspaces, eq(userWorkspaces.workspaceId, workspaces.id));

    const workspacesList = userWorkspacesList.map(uw => uw.workspace);
    res.json(workspacesList);
  } catch (error) {
    console.error('Error in getWorkspaces:', error);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
}

export async function getWorkspace(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    const [workspace] = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspace" });
  }
}

export async function updateWorkspace(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const { name, description } = req.body;

    // Check if workspace exists first
    const [workspace] = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Then verify user is a member
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

    const [updatedWorkspace] = await db.update(workspaces)
      .set({ name, description })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    res.json(updatedWorkspace);
  } catch (error) {
    res.status(500).json({ error: "Failed to update workspace" });
  }
}

export async function deleteWorkspace(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    // Check if workspace exists first
    const [workspace] = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Then verify user is a member
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

    // Delete in correct order to respect foreign key constraints
    // First delete any messages in channels
    await db.delete(channels)
      .where(eq(channels.workspaceId, workspaceId));

    // Then delete workspace memberships
    await db.delete(userWorkspaces)
      .where(eq(userWorkspaces.workspaceId, workspaceId));

    // Finally delete the workspace
    await db.delete(workspaces)
      .where(eq(workspaces.id, workspaceId));

    res.json({ message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete workspace" });
  }
}

export async function getWorkspaceUsers(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    // Check if workspace exists first
    const [workspace] = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Then verify user is a member
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

    // Get all workspace members with user details
    const workspaceUsers = await db
      .select({
        user: users
      })
      .from(userWorkspaces)
      .where(eq(userWorkspaces.workspaceId, workspaceId))
      .innerJoin(users, eq(userWorkspaces.userId, users.id));

    res.json(workspaceUsers.map(wu => wu.user));
  } catch (error) {
    console.error('Error in getWorkspaceUsers:', error);
    res.status(500).json({ error: "Failed to fetch workspace users" });
  }
}

export async function addWorkspaceUser(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const { userId } = req.body;

    // Check if workspace exists first
    const [workspace] = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Then verify user is a member
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

    // Check if user is already a member
    const [existingMembership] = await db.select()
      .from(userWorkspaces)
      .where(and(
        eq(userWorkspaces.workspaceId, workspaceId),
        eq(userWorkspaces.userId, userId)
      ))
      .limit(1);

    if (existingMembership) {
      return res.status(400).json({ error: "User is already a member" });
    }

    await db.insert(userWorkspaces)
      .values({ userId, workspaceId });

    res.json({ message: "User added to workspace successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add user to workspace" });
  }
}

export async function removeWorkspaceUser(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const userId = parseInt(req.params.userId);

    // Check if workspace exists first
    const [workspace] = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Then verify user is a member
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

    // Don't allow removing yourself
    if (userId === req.user!.id) {
      return res.status(400).json({ error: "Cannot remove yourself" });
    }

    await db.delete(userWorkspaces)
      .where(and(
        eq(userWorkspaces.workspaceId, workspaceId),
        eq(userWorkspaces.userId, userId)
      ));

    res.json({ message: "User removed from workspace successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove user from workspace" });
  }
}

export async function getWorkspaceChannels(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    // Check if workspace exists first
    const [workspace] = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Then verify user is a member
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

    const workspaceChannels = await db.select()
      .from(channels)
      .where(eq(channels.workspaceId, workspaceId));

    res.json(workspaceChannels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspace channels" });
  }
}