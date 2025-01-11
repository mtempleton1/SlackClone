import request from 'supertest';
import { app } from '../test-app';
import { db } from '@db';
import { users } from '@db/schema';
import { createTestUser, generateRandomEmail } from '../utils';
import { eq } from 'drizzle-orm';

describe('Users Controller', () => {
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const email = generateRandomEmail();
      const timestamp = Date.now();
      const userData = {
        email,
        username: `user-${timestamp}`,
        displayName: 'New User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(email);
      expect(response.body.displayName).toBe('New User');
      expect(response.body.username).toBe(userData.username);
      expect(response.body).not.toHaveProperty('password');

      // Verify user was created in database
      const [dbUser] = await db.select()
        .from(users)
        .where(eq(users.id, response.body.id))
        .limit(1);

      expect(dbUser).toBeTruthy();
      expect(dbUser.email).toBe(email);
    });

    it('should return 400 if email already exists', async () => {
      const existingUser = await createTestUser();

      const response = await request(app)
        .post('/api/users')
        .send({
          email: existingUser.email,
          username: `user-${Date.now()}`,
          displayName: 'Another User',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if username already exists', async () => {
      const existingUser = await createTestUser();

      const response = await request(app)
        .post('/api/users')
        .send({
          email: generateRandomEmail(),
          username: existingUser.username,
          displayName: 'Another User',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.get('/api/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('email');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:userId', () => {
    it('should return user by id when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.get(`/api/users/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.get('/api/users/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:userId', () => {
    it('should update user when authenticated as that user', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const updateData = {
        displayName: 'Updated Name',
        statusMessage: 'New status'
      };

      const response = await agent
        .put(`/api/users/${user.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.displayName).toBe(updateData.displayName);
      expect(response.body.statusMessage).toBe(updateData.statusMessage);
    });

    it('should return 403 when trying to update different user', async () => {
      const agent = request.agent(app);
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      await agent
        .post('/api/login')
        .send({
          email: user1.email,
          password: 'password123'
        });

      const response = await agent
        .put(`/api/users/${user2.id}`)
        .send({ displayName: 'Hacked!' });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/users/:userId/status', () => {
    it('should update user presence status', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent
        .patch(`/api/users/${user.id}/status`)
        .send({ presenceStatus: false });

      expect(response.status).toBe(200);
      expect(response.body.presenceStatus).toBe(false);

      // Verify status was updated in database
      const [dbUser] = await db.select()
        .from(user)
        .where(eq(users.id, user.id))
        .limit(1);

      expect(dbUser.presenceStatus).toBe(false);
    });
  });

  describe('PATCH /api/users/:userId/profile-picture', () => {
    it('should update user profile picture', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const newPicture = 'https://example.com/picture.jpg';

      const response = await agent
        .patch(`/api/users/${user.id}/profile-picture`)
        .send({ profilePicture: newPicture });

      expect(response.status).toBe(200);
      expect(response.body.profilePicture).toBe(newPicture);

      // Verify picture was updated in database
      const [dbUser] = await db.select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      expect(dbUser.profilePicture).toBe(newPicture);
    });
  });
});