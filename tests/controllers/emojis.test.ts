import request from 'supertest';
import { app } from '../test-app';
import { db } from '@db';
import { emojis, messageReactions, messages, channels, workspaces } from '@db/schema';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';

describe('Emojis Controller', () => {
  describe('GET /api/emojis', () => {
    it('should return all emojis when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create some test emojis
      await db.insert(emojis)
        .values([
          { code: ':smile:' },
          { code: ':heart:' }
        ]);

      const response = await agent.get('/api/emojis');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].code).toBe(':smile:');
      expect(response.body[1].code).toBe(':heart:');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/emojis');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/emojis', () => {
    it('should create a new emoji when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const emojiData = {
        code: ':test_emoji:'
      };

      const response = await agent
        .post('/api/emojis')
        .send(emojiData);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(emojiData.code);

      // Verify emoji was created in database
      const [dbEmoji] = await db.select()
        .from(emojis)
        .where(eq(emojis.id, response.body.id))
        .limit(1);

      expect(dbEmoji).toBeTruthy();
      expect(dbEmoji.code).toBe(emojiData.code);
    });

    it('should return 400 when emoji code already exists', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create an emoji first
      await db.insert(emojis)
        .values({ code: ':duplicate:' });

      const response = await agent
        .post('/api/emojis')
        .send({ code: ':duplicate:' });

      expect(response.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/emojis')
        .send({ code: ':test:' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/emojis/:emojiId', () => {
    it('should delete emoji and its reactions when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create an emoji
      const [emoji] = await db.insert(emojis)
        .values({ code: ':to_delete:' })
        .returning();

      // Create a workspace first
      const [workspace] = await db.insert(workspaces)
        .values({
          name: 'Test Workspace',
          description: 'Test workspace description'
        })
        .returning();

      // Create a channel
      const [channel] = await db.insert(channels)
        .values({
          name: 'general',
          workspaceId: workspace.id,
          topic: 'General discussion'
        })
        .returning();

      // Create a message
      const [message] = await db.insert(messages)
        .values({
          content: 'Test message',
          userId: user.id,
          channelId: channel.id
        })
        .returning();

      // Add some reactions with this emoji
      await db.insert(messageReactions)
        .values({
          messageId: message.id,
          emojiId: emoji.id,
          userId: user.id
        });

      const response = await agent.delete(`/api/emojis/${emoji.id}`);

      expect(response.status).toBe(200);

      // Verify emoji and its reactions were deleted
      const [deletedEmoji] = await db.select()
        .from(emojis)
        .where(eq(emojis.id, emoji.id))
        .limit(1);

      const reactions = await db.select()
        .from(messageReactions)
        .where(eq(messageReactions.emojiId, emoji.id));

      expect(deletedEmoji).toBeUndefined();
      expect(reactions.length).toBe(0);
    });

    it('should return 404 for non-existent emoji', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.delete('/api/emojis/99999');
      expect(response.status).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).delete('/api/emojis/1');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/emojis/:emojiId', () => {
    it('should return emoji with usage stats when authenticated', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      // Create an emoji
      const [emoji] = await db.insert(emojis)
        .values({ code: ':test_stats:' })
        .returning();

      // Create a workspace first
      const [workspace] = await db.insert(workspaces)
        .values({
          name: 'Test Workspace',
          description: 'Test workspace description'
        })
        .returning();

      // Create a channel
      const [channel] = await db.insert(channels)
        .values({
          name: 'general',
          workspaceId: workspace.id,
          topic: 'General discussion'
        })
        .returning();

      // Create a message
      const [message] = await db.insert(messages)
        .values({
          content: 'Test message',
          userId: user.id,
          channelId: channel.id
        })
        .returning();

      // Add some reactions with this emoji
      await db.insert(messageReactions)
        .values([
          {
            messageId: message.id,
            emojiId: emoji.id,
            userId: user.id
          },
          {
            messageId: message.id,
            emojiId: emoji.id,
            userId: user.id
          }
        ]);

      const response = await agent.get(`/api/emojis/${emoji.id}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(':test_stats:');
      expect(response.body.usageCount).toBe(2);
    });

    it('should return 404 for non-existent emoji', async () => {
      const agent = request.agent(app);
      const user = await createTestUser();

      // Login the user
      await agent
        .post('/api/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      const response = await agent.get('/api/emojis/99999');
      expect(response.status).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/emojis/1');
      expect(response.status).toBe(401);
    });
  });
});