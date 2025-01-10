import request from 'supertest';
import { app } from '../test-app';
import { db } from '@db';
import { channels, userChannels, workspaces, userWorkspaces } from '@db/schema';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';

describe('Channels Controller', () => {
  describe('POST /api/channels', () => {
    it('should create a new channel when authenticated and user is workspace member', async () => {
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

      const channelData = {
        workspaceId: workspace.body.id,
        name: 'general',
        topic: 'General discussion'
      };

      const response = await agent
        .post('/api/channels')
        .send(channelData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(channelData.name);
      expect(response.body.topic).toBe(channelData.topic);

      // Verify channel was created in database
      const [dbChannel] = await db.select()
        .from(channels)
        .where(eq(channels.id, response.body.id))
        .limit(1);

      expect(dbChannel).toBeTruthy();
      expect(dbChannel.name).toBe(channelData.name);

      // Verify creator was added as channel member
      const [membership] = await db.select()
        .from(userChannels)
        .where(eq(userChannels.channelId, response.body.id))
        .limit(1);

      expect(membership).toBeTruthy();
      expect(membership.userId).toBe(user.id);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/channels')
        .send({
          workspaceId: 1,
          name: 'general',
          topic: 'General discussion'
        });

      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not workspace member', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create workspace with different user
      const otherUser = await createTestUser();
      const otherAgent = request.agent(app);
      
      await otherAgent
        .post('/api/login')
        .send({
          email: otherUser.email,
          password: 'password123'
        });

      const workspace = await otherAgent
        .post('/api/workspaces')
        .send({
          name: 'Other Workspace',
          description: 'Another workspace'
        });

      const response = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/channels', () => {
    it('should return channels for specified workspace when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create a workspace
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      // Create a channel
      await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      const response = await agent
        .get('/api/channels')
        .query({ workspaceId: workspace.body.id });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('general');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/channels');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/channels/:channelId', () => {
    it('should return channel by id when authenticated and member', async () => {
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

      const response = await agent.get(`/api/channels/${channel.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(channel.body.id);
      expect(response.body.name).toBe(channel.body.name);
    });

    it('should return 404 for non-existent channel', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.get('/api/channels/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/channels/:channelId', () => {
    it('should update channel when authenticated and member', async () => {
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

      const updateData = {
        name: 'updated-general',
        topic: 'Updated topic'
      };

      const response = await agent
        .put(`/api/channels/${channel.body.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.topic).toBe(updateData.topic);
    });

    it('should return 404 for non-existent channel', async () => {
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
        .put('/api/channels/99999')
        .send({
          name: 'updated-general',
          topic: 'Updated topic'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/channels/:channelId', () => {
    it('should delete channel when authenticated and member', async () => {
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

      const response = await agent.delete(`/api/channels/${channel.body.id}`);

      expect(response.status).toBe(200);

      // Verify channel was deleted
      const [deletedChannel] = await db.select()
        .from(channels)
        .where(eq(channels.id, channel.body.id))
        .limit(1);

      expect(deletedChannel).toBeUndefined();
    });

    it('should return 404 for non-existent channel', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.delete('/api/channels/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/channels/:channelId/members', () => {
    it('should return channel members when authenticated', async () => {
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

      const response = await agent.get(`/api/channels/${channel.body.id}/members`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(user.id);
    });
  });

  describe('POST /api/channels/:channelId/members', () => {
    it('should add user to channel when authenticated', async () => {
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

      // Create workspace and channel
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      // Add user2 to workspace
      await agent
        .post(`/api/workspaces/${workspace.body.id}/users`)
        .send({ userId: user2.id });

      const channel = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      const response = await agent
        .post(`/api/channels/${channel.body.id}/members`)
        .send({ userId: user2.id });

      expect(response.status).toBe(200);

      // Verify user2 was added to channel
      const [membership] = await db.select()
        .from(userChannels)
        .where(eq(userChannels.userId, user2.id))
        .limit(1);

      expect(membership).toBeTruthy();
      expect(membership.channelId).toBe(channel.body.id);
    });
  });

  describe('DELETE /api/channels/:channelId/members/:userId', () => {
    it('should remove user from channel when authenticated', async () => {
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

      // Create workspace and channel
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      // Add user2 to workspace
      await agent
        .post(`/api/workspaces/${workspace.body.id}/users`)
        .send({ userId: user2.id });

      const channel = await agent
        .post('/api/channels')
        .send({
          workspaceId: workspace.body.id,
          name: 'general',
          topic: 'General discussion'
        });

      // Add user2 to channel
      await agent
        .post(`/api/channels/${channel.body.id}/members`)
        .send({ userId: user2.id });

      const response = await agent
        .delete(`/api/channels/${channel.body.id}/members/${user2.id}`);

      expect(response.status).toBe(200);

      // Verify user2 was removed from channel
      const [membership] = await db.select()
        .from(userChannels)
        .where(eq(userChannels.userId, user2.id))
        .limit(1);

      expect(membership).toBeUndefined();
    });
  });
});
