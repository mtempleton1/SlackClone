import request from 'supertest';
import { app } from '../test-app';
import { db } from '@db';
import { workspaces, userWorkspaces } from '@db/schema';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';

describe('Workspaces Controller', () => {
  describe('POST /api/workspaces', () => {
    it('should create a new workspace when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const workspaceData = {
        name: 'Test Workspace',
        description: 'A test workspace'
      };

      const response = await agent
        .post('/api/workspaces')
        .send(workspaceData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(workspaceData.name);
      expect(response.body.description).toBe(workspaceData.description);

      // Verify workspace was created in database
      const [dbWorkspace] = await db.select()
        .from(workspaces)
        .where(eq(workspaces.id, response.body.id))
        .limit(1);

      expect(dbWorkspace).toBeTruthy();
      expect(dbWorkspace.name).toBe(workspaceData.name);

      // Verify user was added as workspace member
      const [membership] = await db.select()
        .from(userWorkspaces)
        .where(eq(userWorkspaces.workspaceId, response.body.id))
        .limit(1);

      expect(membership).toBeTruthy();
      expect(membership.userId).toBe(user.id);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/workspaces', () => {
    it('should return user workspaces when authenticated', async () => {
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

      const response = await agent.get('/api/workspaces');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(workspace.body.id);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/workspaces');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/workspaces/:workspaceId', () => {
    it('should return workspace by id when authenticated', async () => {
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

      const response = await agent.get(`/api/workspaces/${workspace.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(workspace.body.id);
      expect(response.body.name).toBe(workspace.body.name);
    });

    it('should return 404 for non-existent workspace', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.get('/api/workspaces/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/workspaces/:workspaceId', () => {
    it('should update workspace when authenticated and user is member', async () => {
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

      const updateData = {
        name: 'Updated Workspace',
        description: 'Updated description'
      };

      const response = await agent
        .put(`/api/workspaces/${workspace.body.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent workspace', async () => {
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
        .put('/api/workspaces/99999')
        .send({
          name: 'Updated Workspace',
          description: 'Updated description'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/workspaces/:workspaceId', () => {
    it('should delete workspace when authenticated and user is member', async () => {
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

      const response = await agent.delete(`/api/workspaces/${workspace.body.id}`);

      expect(response.status).toBe(200);

      // Verify workspace was deleted
      const [deletedWorkspace] = await db.select()
        .from(workspaces)
        .where(eq(workspaces.id, workspace.body.id))
        .limit(1);

      expect(deletedWorkspace).toBeUndefined();
    });

    it('should return 404 for non-existent workspace', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.delete('/api/workspaces/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/workspaces/:workspaceId/users', () => {
    it('should return workspace users when authenticated', async () => {
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

      const response = await agent.get(`/api/workspaces/${workspace.body.id}/users`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(user.id);
    });
  });

  describe('POST /api/workspaces/:workspaceId/users', () => {
    it('should add user to workspace when authenticated', async () => {
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

      // Create a workspace first
      const workspace = await agent
        .post('/api/workspaces')
        .send({
          name: 'Test Workspace',
          description: 'A test workspace'
        });

      const response = await agent
        .post(`/api/workspaces/${workspace.body.id}/users`)
        .send({ userId: user2.id });

      expect(response.status).toBe(200);

      // Verify user2 was added to workspace
      const [membership] = await db.select()
        .from(userWorkspaces)
        .where(eq(userWorkspaces.userId, user2.id))
        .limit(1);

      expect(membership).toBeTruthy();
      expect(membership.workspaceId).toBe(workspace.body.id);
    });
  });

  describe('DELETE /api/workspaces/:workspaceId/users/:userId', () => {
    it('should remove user from workspace when authenticated', async () => {
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

      // Create a workspace first
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

      const response = await agent
        .delete(`/api/workspaces/${workspace.body.id}/users/${user2.id}`);

      expect(response.status).toBe(200);

      // Verify user2 was removed from workspace
      const [membership] = await db.select()
        .from(userWorkspaces)
        .where(eq(userWorkspaces.userId, user2.id))
        .limit(1);

      expect(membership).toBeUndefined();
    });
  });

  describe('GET /api/workspaces/:workspaceId/channels', () => {
    it('should return workspace channels when authenticated', async () => {
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

      const response = await agent.get(`/api/workspaces/${workspace.body.id}/channels`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
