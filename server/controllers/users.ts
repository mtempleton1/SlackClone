import { Request, Response } from "express";
import { db } from "@db";
import { users, userWorkspaces, userChannels } from "@db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../utils";

export async function createUser(req: Request, res: Response) {
  try {
    const { email, displayName, password, username } = req.body;

    // Validate required fields
    if (!email || !displayName || !password || !username) {
      return res.status(400).json({ 
        error: "Missing required fields. Email, displayName, password, and username are required." 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user already exists by email
    const [existingUserByEmail] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if username is taken
    const [existingUserByUsername] = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    const [user] = await db.insert(users)
      .values({
        email,
        displayName,
        password: hashedPassword,
        username,
        presenceStatus: true
      })
      .returning();

    // Return user data without password
    res.status(201).json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      username: user.username
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      profilePicture: users.profilePicture,
      statusMessage: users.statusMessage,
      presenceStatus: users.presenceStatus,
      username: users.username
    })
    .from(users);

    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      statusMessage: user.statusMessage,
      presenceStatus: user.presenceStatus,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    const { displayName, statusMessage } = req.body;

    if (req.user?.id !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this user" });
    }

    // Validate displayName format
    if (displayName && typeof displayName !== 'string') {
      return res.status(400).json({ error: "Invalid display name format" });
    }

    const [updatedUser] = await db.update(users)
      .set({ displayName, statusMessage })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      statusMessage: updatedUser.statusMessage
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);

    if (req.user?.id !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this user" });
    }

    // Remove from workspaces and channels
    await db.delete(userWorkspaces).where(eq(userWorkspaces.userId, userId));
    await db.delete(userChannels).where(eq(userChannels.userId, userId));

    const [deletedUser] = await db.delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    const { presenceStatus } = req.body;

    if (req.user?.id !== userId) {
      return res.status(403).json({ error: "Unauthorized to update status" });
    }

    // Validate presenceStatus type
    if (typeof presenceStatus !== 'boolean') {
      return res.status(400).json({ error: "Invalid presence status format - must be boolean" });
    }

    const [updatedUser] = await db.update(users)
      .set({ presenceStatus })
      .where(eq(users.id, userId))
      .returning();

    res.json({ presenceStatus: updatedUser.presenceStatus });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: "Failed to update user status" });
  }
}

export async function updateProfilePicture(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    const { profilePicture } = req.body;

    if (req.user?.id !== userId) {
      return res.status(403).json({ error: "Unauthorized to update profile picture" });
    }

    // Validate URL format
    try {
      new URL(profilePicture);
    } catch (error) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Check URL length
    if (profilePicture.length > 1024) {
      return res.status(400).json({ error: "URL too long - must be less than 1024 characters" });
    }

    const [updatedUser] = await db.update(users)
      .set({ profilePicture })
      .where(eq(users.id, userId))
      .returning();

    res.json({ profilePicture: updatedUser.profilePicture });
  } catch (error) {
    console.error("Profile picture update error:", error);
    res.status(500).json({ error: "Failed to update profile picture" });
  }
}

export async function updateUserRoles(req: Request, res: Response) {
  // This is a placeholder for role management
  // Implement role-based logic here when adding role system
  res.status(501).json({ error: "Role management not implemented" });
}