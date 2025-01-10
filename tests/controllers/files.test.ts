import request from 'supertest';
import { app } from '../test-app';
import { db } from '@db';
import { files } from '@db/schema';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';

describe('Files Controller', () => {
  // Mock file data for testing
  const testFileContent = 'Test file content';
  const testFileName = 'test.txt';
  const uploadDir = path.join(process.cwd(), 'uploads');

  // Helper function to check response status and show body on failure
  const expectStatus = (response: any, status: number) => {
    try {
      expect(response.status).toBe(status);
    } catch (error) {
      // Show response body in the error message for better debugging
      const bodyInfo = response.body ? `, Response body: ${JSON.stringify(response.body)}` : '';
      throw new Error(`Expected status ${status} but got ${response.status}${bodyInfo}`);
    }
  };

  beforeAll(async () => {
    // Ensure uploads directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
  });

  beforeEach(async () => {
    // Clean database before each test
    await db.delete(files);
  });

  afterEach(async () => {
    // Clean up uploaded files after each test
    try {
      const uploadedFiles = await fs.readdir(uploadDir);
      for (const file of uploadedFiles) {
        await fs.unlink(path.join(uploadDir, file));
      }
    } catch (error) {
      console.error('Error cleaning up files:', error);
    }

    // Clean up database tables
    await db.delete(files);
  });

  describe('POST /api/files', () => {
    it('should upload a file when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent
        .post('/api/files')
        .attach('file', Buffer.from(testFileContent), {
          filename: testFileName,
          contentType: 'text/plain'
        })
        .field('messageId', '');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(user.id);
      expect(response.body.filename).toBeTruthy();
      expect(response.body.fileType).toBe('text/plain');

      // Verify file was created in database
      const [dbFile] = await db
        .select()
        .from(files)
        .where(eq(files.id, response.body.id))
        .limit(1);

      expect(dbFile).toBeTruthy();
      expect(dbFile.userId).toBe(user.id);

      // Verify file exists in filesystem
      const filePath = path.join(uploadDir, dbFile.filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      expect(fileContent).toBe(testFileContent);
    });

    it('should return 400 when no file is uploaded', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent
        .post('/api/files')
        .field('messageId', '');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No file uploaded');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/files')
        .attach('file', Buffer.from(testFileContent), {
          filename: testFileName,
          contentType: 'text/plain'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/files/:fileId', () => {
    it('should download a file when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Upload a file first
      const uploadResponse = await agent
        .post('/api/files')
        .attach('file', Buffer.from(testFileContent), {
          filename: testFileName,
          contentType: 'text/plain'
        })
        .field('messageId', '');

      expect(uploadResponse.status).toBe(201);

      // Now download the file
      const response = await agent
        .get(`/api/files/${uploadResponse.body.id}`)
        .buffer()
        .parse((res: any) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          return new Promise((resolve, reject) => {
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
          });
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/plain');
      expect(response.body.toString('utf-8')).toBe(testFileContent);
    });

    it('should return 404 for non-existent file', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.get('/api/files/99999');
      expectStatus(response, 404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/files/1');
      expectStatus(response, 401);
    });
  });

  describe('DELETE /api/files/:fileId', () => {
    it('should delete a file when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Upload a file first
      const uploadResponse = await agent
        .post('/api/files')
        .attach('file', Buffer.from(testFileContent), {
          filename: testFileName,
          contentType: 'text/plain'
        })
        .field('messageId', '');

      expectStatus(uploadResponse, 201);

      // Get the file record and verify file exists before deletion
      const [fileRecord] = await db.select()
        .from(files)
        .where(eq(files.id, uploadResponse.body.id))
        .limit(1);

      const filePath = path.join(uploadDir, fileRecord.filename);
      const fileExistsBefore = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileExistsBefore).toBe(true);

      const response = await agent.delete(`/api/files/${uploadResponse.body.id}`);

      expectStatus(response, 200);

      // Verify file was deleted from database
      const [deletedFile] = await db.select()
        .from(files)
        .where(eq(files.id, uploadResponse.body.id))
        .limit(1);

      expect(deletedFile).toBeUndefined();

      // Verify file was deleted from filesystem
      const fileExistsAfter = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileExistsAfter).toBe(false);
    });

    it('should return 404 for non-existent file', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.delete('/api/files/99999');
      expectStatus(response, 404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).delete('/api/files/1');
      expectStatus(response, 401);
    });
  });

  describe('PUT /api/files/:fileId/update', () => {
    it('should update file metadata when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Upload a file first
      const uploadResponse = await agent
        .post('/api/files')
        .attach('file', Buffer.from(testFileContent), {
          filename: testFileName,
          contentType: 'text/plain'
        })
        .field('messageId', '');

      expectStatus(uploadResponse, 201);


      const response = await agent
        .put(`/api/files/${uploadResponse.body.id}/update`)
        .send({
          messageId: ''
        });

      expectStatus(response, 200);
      expect(response.body.messageId).toBe('');


      const [updatedFile] = await db.select()
        .from(files)
        .where(eq(files.id, uploadResponse.body.id))
        .limit(1);

      expect(updatedFile).toBeTruthy();
      expect(updatedFile.messageId).toBe('');
    });

    it('should return 404 for non-existent file', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent
        .put('/api/files/99999/update')
        .send({
          messageId: 1
        });

      expectStatus(response, 404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put('/api/files/1/update')
        .send({
          messageId: 1
        });

      expectStatus(response, 401);
    });
  });
});