import { Request, Response } from "express";
import { db } from "@db";
import { organizations } from "@db/schema";
import { eq } from "drizzle-orm";
import "../types";

export async function createOrganization(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const [organization] = await db.insert(organizations)
      .values({ name, description })
      .returning();

    res.status(201).json(organization);
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: "Organization name already exists" });
    }
    console.error('Error in createOrganization:', error);
    res.status(500).json({ error: "Failed to create organization" });
  }
}

export async function getOrganizations(_req: Request, res: Response) {
  try {
    const organizationsList = await db.select()
      .from(organizations)
      .orderBy(organizations.name);

    res.json(organizationsList);
  } catch (error) {
    console.error('Error in getOrganizations:', error);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
}

export async function getOrganization(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.organizationId);

    const [organization] = await db.select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    console.error('Error in getOrganization:', error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
}

export async function updateOrganization(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.organizationId);
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const [organization] = await db.select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const [updatedOrganization] = await db.update(organizations)
      .set({ name, description })
      .where(eq(organizations.id, organizationId))
      .returning();

    res.json(updatedOrganization);
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: "Organization name already exists" });
    }
    console.error('Error in updateOrganization:', error);
    res.status(500).json({ error: "Failed to update organization" });
  }
}