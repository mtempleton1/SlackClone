import { Request, Response } from "express";
import { db } from "@db";
import { files } from "@db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import { UploadedFile } from "express-fileupload";

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Ensure uploads directory exists on startup
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

    try {
      await fs.writeFile(filePath, file.data);
    } catch (error) {
      console.error('Failed to write file:', error);
      return res.status(500).json({ error: "Failed to save file to disk" });
    }

    try {
      const rawMessageId = req.body.messageId;
      const messageId = rawMessageId ? Number(rawMessageId) : null;

      // Check if messageId is provided but invalid
      if (rawMessageId && (Number.isNaN(messageId) || !Number.isInteger(messageId))) {
        await fs.unlink(filePath).catch(console.error);
        return res.status(400).json({ error: "Invalid message ID" });
      }

      const [uploadedFile] = await db.insert(files)
        .values({
          userId: req.user!.id,
          messageId,
          filename: uniqueFilename,
          fileType: file.mimetype
        })
        .returning();

      res.status(201).json(uploadedFile);
    } catch (error) {
      await fs.unlink(filePath).catch(console.error);
      throw error;
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: "Failed to upload file" });
  }
}

export async function getFile(req: Request, res: Response) {
  try {
    const fileId = parseInt(req.params.fileId);
    if (isNaN(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const [fileRecord] = await db.select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(UPLOAD_DIR, fileRecord.filename);

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: "Failed to fetch file" });
  }
}

export async function getFileMetadata(req: Request, res: Response) {
  try {
    const fileId = parseInt(req.params.fileId);
    if (isNaN(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const [fileRecord] = await db.select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(fileRecord);
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(500).json({ error: "Failed to fetch file metadata" });
  }
}

export async function deleteFile(req: Request, res: Response) {
  try {
    const fileId = parseInt(req.params.fileId);
    if (isNaN(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const [fileRecord] = await db.select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(UPLOAD_DIR, fileRecord.filename);

    // Delete the database record first
    const [deletedFile] = await db.delete(files)
      .where(eq(files.id, fileId))
      .returning();

    if (!deletedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    // Then try to delete the file from disk
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete file from disk:', error);
      // Don't fail the request if file deletion fails
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: "Failed to delete file" });
  }
}

export async function updateFile(req: Request, res: Response) {
  try {
    const fileId = parseInt(req.params.fileId);
    if (isNaN(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const rawMessageId = req.body.messageId;
    const messageId = rawMessageId ? Number(rawMessageId) : null;

    // Check if messageId is provided but invalid
    if (rawMessageId && (Number.isNaN(messageId) || !Number.isInteger(messageId))) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    // Check if file exists
    const [existingFile] = await db.select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (!existingFile) {
      return res.status(404).json({ error: "File not found" });
    }

    // Update the file metadata
    const [updatedFile] = await db.update(files)
      .set({ messageId })
      .where(eq(files.id, fileId))
      .returning();

    res.json(updatedFile);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: "Failed to update file" });
  }
}