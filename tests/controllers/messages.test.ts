import request from 'supertest';
import { app } from '../test-app';
import { db } from '@db';
import { messages, channels, workspaces } from '@db/schema';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';

describe('Messages Controller', () => {
  describe('POST /api/messages', () => {
    it('should create a new message when authenticated', async () => {
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

      const messageData = {
        content: 'Hello World',
        channelId: channel.body.id
      };

      const response = await agent
        .post('/api/messages')
        .send(messageData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe(messageData.content);
      expect(response.body.userId).toBe(user.id);
      expect(response.body.channelId).toBe(channel.body.id);

      // Verify message was created in database
      const [dbMessage] = await db.select()
        .from(messages)
        .where(eq(messages.id, response.body.id))
        .limit(1);

      expect(dbMessage).toBeTruthy();
      expect(dbMessage.content).toBe(messageData.content);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          content: 'Hello World',
          channelId: 1
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/messages/:messageId', () => {
    it('should return message by id when authenticated', async () => {
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

      // Create a message first
      const [message] = await db.insert(messages)
        .values({
          content: 'Test message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      const response = await agent.get(`/api/messages/${message.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(message.id);
      expect(response.body.content).toBe(message.content);
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

      const response = await agent.get('/api/messages/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/messages/:messageId', () => {
    it('should update message when authenticated and user is author', async () => {
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

      // Create a message first
      const [message] = await db.insert(messages)
        .values({
          content: 'Original message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      const updateData = {
        content: 'Updated message'
      };

      const response = await agent
        .put(`/api/messages/${message.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(updateData.content);

      // Verify message was updated in database
      const [updatedMessage] = await db.select()
        .from(messages)
        .where(eq(messages.id, message.id))
        .limit(1);

      expect(updatedMessage).toBeTruthy();
      expect(updatedMessage.content).toBe(updateData.content);
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

      const response = await agent
        .put('/api/messages/99999')
        .send({
          content: 'Updated message'
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 when user is not message author', async () => {
      const agent = request.agent(app);
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      // Login as user1
      await agent
        .post('/api/login')
        .send({
          email: user1.email,
          password: 'password123'
        });

      // Create workspace and channel as user1
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

      // Create message as user2
      const [message] = await db.insert(messages)
        .values({
          content: 'Original message',
          userId: user2.id,
          channelId: channel.body.id
        })
        .returning();

      const response = await agent
        .put(`/api/messages/${message.id}`)
        .send({
          content: 'Updated message'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/messages/:messageId', () => {
    it('should delete message when authenticated and user is author', async () => {
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

      // Create a message first
      const [message] = await db.insert(messages)
        .values({
          content: 'Test message',
          userId: user.id,
          channelId: channel.body.id
        })
        .returning();

      const response = await agent.delete(`/api/messages/${message.id}`);

      expect(response.status).toBe(200);

      // Verify message was deleted
      const [deletedMessage] = await db.select()
        .from(messages)
        .where(eq(messages.id, message.id))
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

      const response = await agent.delete('/api/messages/99999');
      expect(response.status).toBe(404);
    });

    it('should return 403 when user is not message author', async () => {
      const agent = request.agent(app);
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      // Login as user1
      await agent
        .post('/api/login')
        .send({
          email: user1.email,
          password: 'password123'
        });

      // Create workspace and channel as user1
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

      // Create message as user2
      const [message] = await db.insert(messages)
        .values({
          content: 'Test message',
          userId: user2.id,
          channelId: channel.body.id
        })
        .returning();

      const response = await agent.delete(`/api/messages/${message.id}`);
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/channels/:channelId/messages', () => {
    it('should return channel messages when authenticated', async () => {
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

      // Create a few messages
      await db.insert(messages)
        .values([{
          content: 'Message 1',
          userId: user.id,
          channelId: channel.body.id
        }, {
          content: 'Message 2',
          userId: user.id,
          channelId: channel.body.id
        }]);

      const response = await agent.get(`/api/channels/${channel.body.id}/messages`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].content).toBe('Message 1');
      expect(response.body[1].content).toBe('Message 2');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/channels/1/messages');
      expect(response.status).toBe(401);
    });
  });
});
