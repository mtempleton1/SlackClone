import { Request, Response } from "express";
import { db } from "@db";
import { files } from "@db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import { UploadedFile } from "express-fileupload";
import "../types";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

ensureUploadDir();

export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.files || !("file" in req.files)) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file as UploadedFile;
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${randomBytes(16).toString("hex")}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    await fs.writeFile(filePath, file.data);

    const [uploadedFile] = await db.insert(files)
      .values({
        userId: req.user!.id,
        messageId: req.body.messageId ? parseInt(req.body.messageId) : null,
        filename: uniqueFilename,
        fileType: file.mimetype
      })
      .returning();

    res.status(201).json(uploadedFile);
  } catch (error) {
    res.status(500).json({ error: "Failed to upload file" });
  }
}

export async function getFile(req: Request, res: Response) {
  try {
    const fileId = parseInt(req.params.fileId);

    const [fileRecord] = await db.select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(UPLOAD_DIR, fileRecord.filename);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch file" });
  }
}

export async function getFileMetadata(req: Request, res: Response) {
  try {
    const fileId = parseInt(req.params.fileId);

    const [fileRecord] = await db.select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(fileRecord);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch file metadata" });
  }
}

export async function deleteFile(req: Request, res: Response) {
  try {
    const fileId = parseInt(req.params.fileId);

    const [fileRecord] = await db.select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(UPLOAD_DIR, fileRecord.filename);
    await fs.unlink(filePath);

    // Delete database record
    await db.delete(files)
      .where(eq(files.id, fileId));

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete file" });
  }
}

export async function updateFile(req: Request, res: Response) {
  try {
    const fileId = parseInt(req.params.fileId);
    const { messageId } = req.body;

    const [updatedFile] = await db.update(files)
      .set({ messageId })
      .where(eq(files.id, fileId))
      .returning();

    if (!updatedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(updatedFile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update file" });
  }
}