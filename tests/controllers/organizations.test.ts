import request from 'supertest';
import { app } from '../test-app';
import { db } from '@db';
import { organizations } from '@db/schema';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';

describe('Organizations Controller', () => {
  // Clean up before each test
  beforeEach(async () => {
    await db.delete(organizations);
  });

  describe('POST /api/organizations', () => {
    it('should create a new organization when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const timestamp = Date.now();
      const organizationData = {
        name: `Test Organization ${timestamp}`,
        description: 'A test organization'
      };

      const response = await agent
        .post('/api/organizations')
        .send(organizationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(organizationData.name);
      expect(response.body.description).toBe(organizationData.description);

      // Verify organization was created in database
      const [dbOrganization] = await db.select()
        .from(organizations)
        .where(eq(organizations.id, response.body.id))
        .limit(1);

      expect(dbOrganization).toBeTruthy();
      expect(dbOrganization.name).toBe(organizationData.name);
    });

    it('should return 400 when organization name is missing', async () => {
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
        .post('/api/organizations')
        .send({ description: 'A test organization' });

      expect(response.status).toBe(400);
    });

    it('should return 400 when organization name already exists', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const timestamp = Date.now();
      const orgName = `Duplicate Org ${timestamp}`;

      // Create first organization
      await agent
        .post('/api/organizations')
        .send({
          name: orgName,
          description: 'First organization'
        });

      // Try to create organization with same name
      const response = await agent
        .post('/api/organizations')
        .send({
          name: orgName,
          description: 'Second organization'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Test Organization',
          description: 'A test organization'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/organizations', () => {
    it('should return all organizations when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const timestamp = Date.now();
      // Create some test organizations
      await db.insert(organizations)
        .values([
          { name: `Org 1 ${timestamp}`, description: 'First organization' },
          { name: `Org 2 ${timestamp}`, description: 'Second organization' }
        ]);

      const response = await agent.get('/api/organizations');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe(`Org 1 ${timestamp}`);
      expect(response.body[1].name).toBe(`Org 2 ${timestamp}`);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/organizations');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/organizations/:organizationId', () => {
    it('should return organization by id when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const timestamp = Date.now();
      // Create an organization first
      const [organization] = await db.insert(organizations)
        .values({
          name: `Test Org ${timestamp}`,
          description: 'A test organization'
        })
        .returning();

      const response = await agent.get(`/api/organizations/${organization.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(organization.id);
      expect(response.body.name).toBe(organization.name);
      expect(response.body.description).toBe(organization.description);
    });

    it('should return 404 for non-existent organization', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.get('/api/organizations/99999');
      expect(response.status).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/organizations/1');
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/organizations/:organizationId', () => {
    it('should update organization when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const timestamp = Date.now();
      // Create an organization first
      const [organization] = await db.insert(organizations)
        .values({
          name: `Original Name ${timestamp}`,
          description: 'Original description'
        })
        .returning();

      const updateData = {
        name: `Updated Name ${timestamp}`,
        description: 'Updated description'
      };

      const response = await agent
        .put(`/api/organizations/${organization.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);

      // Verify organization was updated in database
      const [dbOrganization] = await db.select()
        .from(organizations)
        .where(eq(organizations.id, organization.id))
        .limit(1);

      expect(dbOrganization).toBeTruthy();
      expect(dbOrganization.name).toBe(updateData.name);
      expect(dbOrganization.description).toBe(updateData.description);
    });

    it('should return 400 when organization name is missing', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const timestamp = Date.now();
      // Create an organization first
      const [organization] = await db.insert(organizations)
        .values({
          name: `Test Org ${timestamp}`,
          description: 'Test description'
        })
        .returning();

      const response = await agent
        .put(`/api/organizations/${organization.id}`)
        .send({ description: 'Updated description' });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent organization', async () => {
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
        .put('/api/organizations/99999')
        .send({
          name: 'Updated Name',
          description: 'Updated description'
        });

      expect(response.status).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put('/api/organizations/1')
        .send({
          name: 'Updated Name',
          description: 'Updated description'
        });

      expect(response.status).toBe(401);
    });
  });
});