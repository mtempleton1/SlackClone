import request from 'supertest';
import { app } from '../test-app';
import { db } from '@db';
import { threads, threadMessages, messages, channels, workspaces, userWorkspaces } from '@db/schema';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';

describe('Threads Controller', () => {
  describe('POST /api/threads', () => {
    it('should create a new thread when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create a workspace first
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      // Create a channel
      const channel = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      // Create parent message
      const [parentMessage] = await db.insert(messages)
        .values({
          content: 'Parent message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      const threadData = {
        parentMessageId: parentMessage.id,
        content: 'First thread message'
      };

      const response = await agent
        .post('/api/threads')
        .send(threadData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('thread');
      expect(response.body).toHaveProperty('message');
      expect(response.body.thread.parentMessageId).toBe(parentMessage.id);
      expect(response.body.message.content).toBe(threadData.content);

      // Verify thread was created in database
      const [dbThread] = await db.select()
        .from(threads)
        .where(eq(threads.id, response.body.thread.id))
        .limit(1);

      expect(dbThread).toBeTruthy();
      expect(dbThread.parentMessageId).toBe(parentMessage.id);

      // Verify thread message was created
      const [dbMessage] = await db.select()
        .from(threadMessages)
        .where(eq(threadMessages.threadId, response.body.thread.id))
        .limit(1);

      expect(dbMessage).toBeTruthy();
      expect(dbMessage.content).toBe(threadData.content);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/threads')
        .send({
          parentMessageId: 1,
          content: 'Test message'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/threads/:threadId', () => {
    it('should return thread by id when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create workspace and channel
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      const channel = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      // Create parent message
      const [parentMessage] = await db.insert(messages)
        .values({
          content: 'Parent message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      // Create thread and message
      const [thread] = await db.insert(threads)
        .values({ parentMessageId: parentMessage.id })
        .returning();

      const [threadMessage] = await db.insert(threadMessages)
        .values({
          threadId: thread.id,
          content: 'Thread message',
          userId: user.id
        })
        .returning();

      const response = await agent.get(`/api/threads/${thread.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(thread.id);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].id).toBe(threadMessage.id);
      expect(response.body.parentMessage.id).toBe(parentMessage.id);
    });

    it('should return 404 for non-existent thread', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

    it('should return thread with only parent message when no child messages exist', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create workspace and channel
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      const channel = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      // Create parent message
      const [parentMessage] = await db.insert(messages)
        .values({
          content: 'Parent message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      // Create thread without any messages
      const [thread] = await db.insert(threads)
        .values({ parentMessageId: parentMessage.id })
        .returning();

      const response = await agent.get(`/api/threads/${thread.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(thread.id);
      expect(response.body.messages).toHaveLength(0);
      expect(response.body.parentMessage.id).toBe(parentMessage.id);
    });


      const response = await agent.get('/api/threads/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/threads/:threadId/messages', () => {
    it('should create a thread message when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create workspace and channel
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      const channel = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      // Create parent message
      const [parentMessage] = await db.insert(messages)
        .values({
          content: 'Parent message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      // Create thread
      const [thread] = await db.insert(threads)
        .values({ parentMessageId: parentMessage.id })
        .returning();

      const messageData = {
        content: 'New thread message'
      };

      const response = await agent
        .post(`/api/threads/${thread.id}/messages`)
        .send(messageData);

      expect(response.status).toBe(201);
      expect(response.body.content).toBe(messageData.content);
      expect(response.body.userId).toBe(user.id);

      // Verify message was created in database
      const [dbMessage] = await db.select()
        .from(threadMessages)
        .where(eq(threadMessages.id, response.body.id))
        .limit(1);

      expect(dbMessage).toBeTruthy();
      expect(dbMessage.content).toBe(messageData.content);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/threads/1/messages')
        .send({
          content: 'Test message'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/threads/:threadId/messages/:messageId', () => {
    it('should delete thread message when authenticated and user is author', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create workspace and channel
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      const channel = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      // Create parent message
      const [parentMessage] = await db.insert(messages)
        .values({
          content: 'Parent message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      // Create thread
      const [thread] = await db.insert(threads)
        .values({ parentMessageId: parentMessage.id })
        .returning();

      // Create thread message
      const [threadMessage] = await db.insert(threadMessages)
        .values({
          threadId: thread.id,
          content: 'Thread message',
          userId: user.id
        })
        .returning();

      const response = await agent.delete(`/api/threads/${thread.id}/messages/${threadMessage.id}`);

      expect(response.status).toBe(200);

      // Verify message was deleted
      const [deletedMessage] = await db.select()
        .from(threadMessages)
        .where(eq(threadMessages.id, threadMessage.id))
        .limit(1);

      expect(deletedMessage).toBeUndefined();
    });

    it('should return 404 for non-existent message', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.delete('/api/threads/1/messages/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/threads/:threadId/participants', () => {
    it('should return thread participants when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create workspace and channel
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      const channel = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      // Create parent message
      const [parentMessage] = await db.insert(messages)
        .values({
          content: 'Parent message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      // Create thread
      const [thread] = await db.insert(threads)
        .values({ parentMessageId: parentMessage.id })
        .returning();

      // Create thread message
      await db.insert(threadMessages)
        .values({
          threadId: thread.id,
          content: 'Thread message',
          userId: user.id
        });

      const response = await agent.get(`/api/threads/${thread.id}/participants`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(user.id);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/threads/1/participants');
      expect(response.status).toBe(401);
    });
  });
});