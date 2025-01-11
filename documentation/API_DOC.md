# Real-time Communication Platform API Documentation

## Project Overview
A cutting-edge real-time communication platform designed to revolutionize workspace collaboration through intelligent messaging and advanced communication technologies. The platform provides comprehensive support for workspace management, channel-based communications, threaded conversations, emoji reactions, file sharing, and real-time updates.

## Technical Stack

### Backend Framework and Runtime
- Express.js with TypeScript
- Node.js runtime environment

### Database and ORM
- PostgreSQL for data persistence
- Drizzle ORM for database operations
- Drizzle Kit for schema management

### Authentication
- Passport.js for authentication middleware
- Express-session for session management
- MemoryStore for session storage

### Real-time Communication
- WebSocket (ws) for real-time messaging
- Socket handling for live updates

### File Handling
- Express-fileupload for file upload management

### Development Tools
- TypeScript for type-safe development
- Vite for frontend development and bundling
- ESBuild for TypeScript/JavaScript compilation

## API Documentation

### Organizations Controller
Manages organization-level operations within the platform.

* `POST /api/organizations`
  - Purpose: Create a new organization
  - Auth Required: Yes
  - Returns: Created organization details

* `GET /api/organizations`
  - Purpose: Retrieve all organizations accessible to the user
  - Auth Required: Yes
  - Returns: Array of organization objects

* `GET /api/organizations/:organizationId`
  - Purpose: Get details of a specific organization
  - Auth Required: Yes
  - Returns: Organization details object

* `PUT /api/organizations/:organizationId`
  - Purpose: Update organization information
  - Auth Required: Yes
  - Returns: Updated organization details

### Users Controller
Handles user account management and authentication.

* `POST /api/users`
  - Purpose: Create a new user account
  - Auth Required: No
  - Returns: Created user details

* `GET /api/users`
  - Purpose: Retrieve all users in the system
  - Auth Required: Yes
  - Returns: Array of user objects

* `GET /api/users/:userId`
  - Purpose: Get specific user details
  - Auth Required: Yes
  - Returns: User details object

* `PUT /api/users/:userId`
  - Purpose: Update user information
  - Auth Required: Yes
  - Returns: Updated user details

* `DELETE /api/users/:userId`
  - Purpose: Delete a user account
  - Auth Required: Yes
  - Returns: Deletion confirmation

* `PATCH /api/users/:userId/status`
  - Purpose: Update user's online status
  - Auth Required: Yes
  - Returns: Updated status details

* `PATCH /api/users/:userId/profile-picture`
  - Purpose: Update user's profile picture
  - Auth Required: Yes
  - Returns: Updated profile picture URL

* `PATCH /api/users/:userId/roles`
  - Purpose: Update user's role assignments
  - Auth Required: Yes
  - Returns: Updated roles information

### Workspaces Controller
Manages workspace creation and management.

* `POST /api/workspaces`
  - Purpose: Create a new workspace
  - Auth Required: Yes
  - Returns: Created workspace details

* `GET /api/workspaces`
  - Purpose: List all accessible workspaces
  - Auth Required: Yes
  - Returns: Array of workspace objects

* `GET /api/workspaces/:workspaceId`
  - Purpose: Get specific workspace details
  - Auth Required: Yes
  - Returns: Workspace details object

* `PUT /api/workspaces/:workspaceId`
  - Purpose: Update workspace information
  - Auth Required: Yes
  - Returns: Updated workspace details

* `DELETE /api/workspaces/:workspaceId`
  - Purpose: Delete a workspace
  - Auth Required: Yes
  - Returns: Deletion confirmation

* `GET /api/workspaces/:workspaceId/users`
  - Purpose: List workspace members
  - Auth Required: Yes
  - Returns: Array of user objects

* `POST /api/workspaces/:workspaceId/users`
  - Purpose: Add user to workspace
  - Auth Required: Yes
  - Returns: Updated workspace membership

* `DELETE /api/workspaces/:workspaceId/users/:userId`
  - Purpose: Remove user from workspace
  - Auth Required: Yes
  - Returns: Updated workspace membership

* `GET /api/workspaces/:workspaceId/channels`
  - Purpose: List workspace channels
  - Auth Required: Yes
  - Returns: Array of channel objects

### Channels Controller
Handles channel operations within workspaces.

* `POST /api/channels`
  - Purpose: Create a new channel
  - Auth Required: Yes
  - Returns: Created channel details

* `GET /api/channels`
  - Purpose: List all accessible channels
  - Auth Required: Yes
  - Returns: Array of channel objects

* `GET /api/channels/:channelId`
  - Purpose: Get specific channel details
  - Auth Required: Yes
  - Returns: Channel details object

* `PUT /api/channels/:channelId`
  - Purpose: Update channel information
  - Auth Required: Yes
  - Returns: Updated channel details

* `DELETE /api/channels/:channelId`
  - Purpose: Delete a channel
  - Auth Required: Yes
  - Returns: Deletion confirmation

* `GET /api/channels/:channelId/members`
  - Purpose: List channel members
  - Auth Required: Yes
  - Returns: Array of user objects

* `POST /api/channels/:channelId/members`
  - Purpose: Add member to channel
  - Auth Required: Yes
  - Returns: Updated channel membership

* `DELETE /api/channels/:channelId/members/:userId`
  - Purpose: Remove member from channel
  - Auth Required: Yes
  - Returns: Updated channel membership

### Messages Controller
Manages message operations including threads and reactions.

* `POST /api/messages`
  - Purpose: Create a new message
  - Auth Required: Yes
  - Returns: Created message details

* `GET /api/messages/:messageId`
  - Purpose: Get specific message details
  - Auth Required: Yes
  - Returns: Message details object

* `PUT /api/messages/:messageId`
  - Purpose: Update message content
  - Auth Required: Yes
  - Returns: Updated message details

* `DELETE /api/messages/:messageId`
  - Purpose: Delete a message
  - Auth Required: Yes
  - Returns: Deletion confirmation

* `GET /api/messages/:messageId/reactions`
  - Purpose: Get message reactions
  - Auth Required: Yes
  - Returns: Array of reaction objects

* `POST /api/messages/:messageId/reactions`
  - Purpose: Add reaction to message
  - Auth Required: Yes
  - Returns: Created reaction details

* `DELETE /api/messages/:messageId/reactions/:emojiId`
  - Purpose: Remove reaction from message
  - Auth Required: Yes
  - Returns: Updated reaction list

* `GET /api/channels/:channelId/messages`
  - Purpose: Get channel messages
  - Auth Required: Yes
  - Returns: Array of message objects

* `GET /api/messages/:messageId/replies`
  - Purpose: Get thread messages
  - Auth Required: Yes
  - Returns: Array of reply messages

* `POST /api/messages/:messageId/replies`
  - Purpose: Add reply to thread
  - Auth Required: Yes
  - Returns: Created reply details

### Emojis Controller
Manages custom emoji operations.

* `GET /api/emojis`
  - Purpose: List all available emojis
  - Auth Required: Yes
  - Returns: Array of emoji objects

* `POST /api/emojis`
  - Purpose: Add custom emoji
  - Auth Required: Yes
  - Returns: Created emoji details

* `DELETE /api/emojis/:emojiId`
  - Purpose: Delete custom emoji
  - Auth Required: Yes
  - Returns: Deletion confirmation

* `GET /api/emojis/:emojiId`
  - Purpose: Get specific emoji details
  - Auth Required: Yes
  - Returns: Emoji details object

### Files Controller
Handles file upload and management.

* `POST /api/files`
  - Purpose: Upload new file
  - Auth Required: Yes
  - Returns: Uploaded file details

* `GET /api/files/:fileId`
  - Purpose: Download file
  - Auth Required: Yes
  - Returns: File data

* `GET /api/files/:fileId/metadata`
  - Purpose: Get file metadata
  - Auth Required: Yes
  - Returns: File metadata object

* `DELETE /api/files/:fileId`
  - Purpose: Delete file
  - Auth Required: Yes
  - Returns: Deletion confirmation

* `PUT /api/files/:fileId/update`
  - Purpose: Update file metadata
  - Auth Required: Yes
  - Returns: Updated file details

## Authentication
All endpoints except user registration require authentication. The platform uses session-based authentication with Passport.js. Requests must include proper session cookies obtained through the login process.

## Real-time Features
The platform implements WebSocket connections for real-time updates including:
- Message delivery
- User status changes
- Typing indicators
- Reaction updates
- Thread activity notifications

## Rate Limiting
API endpoints implement rate limiting to prevent abuse. Specific limits vary by endpoint and user role.

## Error Handling
The API uses standard HTTP status codes and returns JSON responses with error messages when applicable.

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
