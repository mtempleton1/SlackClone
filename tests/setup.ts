/// <reference types="jest" />
import { db } from '@db';
import { users, workspaces, channels, messages, threads, emojis } from '@db/schema';
import { sql } from 'drizzle-orm';

// Increase test timeout
const timeout = 30000;
jest.setTimeout(timeout);

// Clean up database before each test
beforeEach(async () => {
  try {
    // Delete data in reverse order of dependencies
    await db.delete(threads);
    await db.delete(messages);
    await db.delete(channels);
    await db.delete(workspaces);
    await db.delete(users);
    await db.delete(emojis);
  } catch (error) {
    console.error('Error cleaning up database:', error);
    throw error;
  }
});

// Clean up database after all tests
afterAll(async () => {
  try {
    // Reset all sequences
    await db.execute(sql`
      ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
      ALTER SEQUENCE workspaces_workspace_id_seq RESTART WITH 1;
      ALTER SEQUENCE channels_channel_id_seq RESTART WITH 1;
      ALTER SEQUENCE messages_message_id_seq RESTART WITH 1;
      ALTER SEQUENCE threads_thread_id_seq RESTART WITH 1;
      ALTER SEQUENCE emojis_emoji_id_seq RESTART WITH 1;
    `);
  } catch (error) {
    console.error('Error resetting sequences:', error);
    throw error;
  }
});