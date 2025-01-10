import { Request, Response } from "express";
import { db } from "@db";
import { workspaces, channels, userWorkspaces } from "@db/schema";
import { and, eq } from "drizzle-orm";
import "../types";

export async function createWorkspace(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

    const [workspace] = await db.insert(workspaces)
      .values({ name, description })
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
    const userWorkspacesList = await db.query.userWorkspaces.findMany({
      where: eq(userWorkspaces.userId, req.user!.id),
      with: {
        workspace: true
      }
    });

    const workspacesList = userWorkspacesList.map(uw => uw.workspace);
    res.json(workspacesList);
  } catch (error) {
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

    const [updatedWorkspace] = await db.update(workspaces)
      .set({ name, description })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    if (!updatedWorkspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    res.json(updatedWorkspace);
  } catch (error) {
    res.status(500).json({ error: "Failed to update workspace" });
  }
}

export async function deleteWorkspace(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    // Delete all channels in workspace
    await db.delete(channels)
      .where(eq(channels.workspaceId, workspaceId));

    // Delete workspace memberships
    await db.delete(userWorkspaces)
      .where(eq(userWorkspaces.workspaceId, workspaceId));

    // Delete the workspace
    const [deletedWorkspace] = await db.delete(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .returning();

    if (!deletedWorkspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    res.json({ message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete workspace" });
  }
}

export async function getWorkspaceUsers(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    const workspaceUsers = await db.query.userWorkspaces.findMany({
      where: eq(userWorkspaces.workspaceId, workspaceId),
      with: {
        user: true
      }
    });

    res.json(workspaceUsers.map(wu => wu.user));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspace users" });
  }
}

export async function addWorkspaceUser(req: Request, res: Response) {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const { userId } = req.body;

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

    const workspaceChannels = await db.select()
      .from(channels)
      .where(eq(channels.workspaceId, workspaceId));

    res.json(workspaceChannels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspace channels" });
  }
}