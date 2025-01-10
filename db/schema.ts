import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { pgTable, serial, varchar, text, boolean, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const organizations = pgTable('organizations', {
  id: serial('organization_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow()
});

export const users = pgTable('users', {
  id: serial('user_id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  displayName: varchar('display_name', { length: 50 }).notNull(),
  profilePicture: varchar('profile_picture', { length: 255 }),
  statusMessage: varchar('status_message', { length: 150 }),
  presenceStatus: boolean('presence_status').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const workspaces = pgTable('workspaces', {
  id: serial('workspace_id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow()
});

export const channels = pgTable('channels', {
  id: serial('channel_id').primaryKey(),
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  topic: text('topic'),
  createdAt: timestamp('created_at').defaultNow()
});

export const messages = pgTable('messages', {
  id: serial('message_id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  channelId: integer('channel_id').references(() => channels.id),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow()
});

export const files = pgTable('files', {
  id: serial('file_id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  messageId: integer('message_id').references(() => messages.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 50 }),
  uploadTime: timestamp('upload_time').defaultNow()
});

export const threads = pgTable('threads', {
  id: serial('thread_id').primaryKey(),
  parentMessageId: integer('parent_message_id').references(() => messages.id).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const threadMessages = pgTable('thread_messages', {
  id: serial('thread_message_id').primaryKey(),
  threadId: integer('thread_id').references(() => threads.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow()
});

export const emojis = pgTable('emojis', {
  id: serial('emoji_id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique()
});

export const messageReactions = pgTable('message_reactions', {
  id: serial('reaction_id').primaryKey(),
  messageId: integer('message_id').references(() => messages.id),
  emojiId: integer('emoji_id').references(() => emojis.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const userWorkspaces = pgTable('user_workspaces', {
  userId: integer('user_id').references(() => users.id).notNull(),
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.workspaceId] })
}));

export const userChannels = pgTable('user_channels', {
  userId: integer('user_id').references(() => users.id).notNull(),
  channelId: integer('channel_id').references(() => channels.id).notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.channelId] })
}));

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  workspaces: many(workspaces)
}));

export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(userWorkspaces),
  channels: many(userChannels),
  messages: many(messages),
  reactions: many(messageReactions),
  files: many(files),
  threadMessages: many(threadMessages)
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [workspaces.organizationId],
    references: [organizations.id],
  }),
  channels: many(channels),
  users: many(userWorkspaces)
}));

export const channelsRelations = relations(channels, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [channels.workspaceId],
    references: [workspaces.id],
  }),
  messages: many(messages),
  users: many(userChannels)
}));

export const threadMessagesRelations = relations(threadMessages, ({ one }) => ({
  thread: one(threads, {
    fields: [threadMessages.threadId],
    references: [threads.id],
  }),
  user: one(users, {
    fields: [threadMessages.userId],
    references: [users.id],
  })
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  parentMessage: one(messages, {
    fields: [threads.parentMessageId],
    references: [messages.id],
  }),
  messages: many(threadMessages)
}));

// Validation Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertWorkspaceSchema = createInsertSchema(workspaces);
export const selectWorkspaceSchema = createSelectSchema(workspaces);

export const insertChannelSchema = createInsertSchema(channels);
export const selectChannelSchema = createSelectSchema(channels);

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);

export const insertOrganizationSchema = createInsertSchema(organizations);
export const selectOrganizationSchema = createSelectSchema(organizations);


// Types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Workspace = InferSelectModel<typeof workspaces>;
export type Channel = InferSelectModel<typeof channels>;
export type Message = InferSelectModel<typeof messages>;
export type Thread = InferSelectModel<typeof threads>;
export type File = InferSelectModel<typeof files>;
export type Emoji = InferSelectModel<typeof emojis>;
export type MessageReaction = InferSelectModel<typeof messageReactions>;
export type ThreadMessage = InferSelectModel<typeof threadMessages>;
export type NewThreadMessage = InferInsertModel<typeof threadMessages>;
export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = InferInsertModel<typeof organizations>;
export type NewWorkspace = InferInsertModel<typeof workspaces>;