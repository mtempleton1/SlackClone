/// <reference types="jest" />
import { db } from '@db';
import { users, workspaces, channels, messages, threads, emojis, userWorkspaces, userChannels, messageReactions, threadMessages } from '@db/schema';
import { sql } from 'drizzle-orm';

// Increase test timeout
const timeout = 30000;
jest.setTimeout(timeout);

// Clean up database before each test
beforeEach(async () => {
  try {
    // Delete data in reverse order of dependencies
    await db.delete(messageReactions);
    await db.delete(threadMessages);
    await db.delete(threads);
    await db.delete(messages);
    await db.delete(userChannels);
    await db.delete(channels);
    await db.delete(userWorkspaces);
    await db.delete(workspaces);
    await db.delete(users);
    await db.delete(emojis);
  } catch (error) {
    console.error('Error cleaning up database:', error);
    throw error;
  }
});

// Clean up database and reset sequences after all tests
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
      ALTER SEQUENCE message_reactions_reaction_id_seq RESTART WITH 1;
      ALTER SEQUENCE thread_messages_thread_message_id_seq RESTART WITH 1;
    `);

    // Ensure all queries are complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Close any open WebSocket connections
    if (global.WebSocket) {
      const sockets = Object.values(global.WebSocket.prototype);
      sockets.forEach((socket: any) => {
        if (socket && typeof socket.close === 'function') {
          socket.close();
        }
      });
    }
  } catch (error) {
    console.error('Error in cleanup:', error);
    throw error;
  }
});