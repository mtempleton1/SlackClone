# Real-time Communication Platform API Documentation

## Project Overview
A comprehensive real-time communication platform designed to enhance workspace collaboration through intelligent messaging and advanced communication technologies. The platform facilitates seamless team interactions with features including real-time messaging, channel management, file attachments, emoji reactions, and message threading capabilities.

## Technical Stack

### Backend Framework
- **Node.js/Express.js** with TypeScript
- Server configured using Vite.js for development
- WebSocket support through Socket.IO

### Database
- **PostgreSQL** as the primary database
- **Drizzle ORM** for database operations and schema management
- Connection pooling and real-time subscriptions via WebSocket

### Authentication & Security
- **Passport.js** for authentication middleware
- Session-based authentication with express-session
- Memorystore for session management

### Frontend Technologies
- **React** with TypeScript
- **TailwindCSS** for styling
- **Shadcn UI** components
- **Tanstack Query** for data fetching
- **Wouter** for routing

### Real-time Features
- WebSocket/Socket.IO for real-time messaging
- Event-driven architecture for real-time updates

## API Endpoints

### Users Controller
Manages user-related operations including profile management and authentication.

- **Create User**
  - Path: `/api/users`
  - Method: `POST`
  - Description: Create a new user account with profile information
  - Returns: Created user object with ID and profile details

- **Get Users**
  - Path: `/api/users`
  - Method: `GET`
  - Description: Retrieve a list of all user accounts in the system
  - Returns: Array of user objects

- **Get User**
  - Path: `/api/users/{userId}`
  - Method: `GET`
  - Description: Retrieve detailed information for a specific user
  - Returns: Detailed user object including profile information

- **Update User**
  - Path: `/api/users/{userId}`
  - Method: `PUT`
  - Description: Update profile information for a specific user
  - Returns: Updated user object

- **Delete User**
  - Path: `/api/users/{userId}`
  - Method: `DELETE`
  - Description: Delete a user account
  - Returns: Success confirmation

- **Update User Status**
  - Path: `/api/users/{userId}/status`
  - Method: `PATCH`
  - Description: Update user's online presence status
  - Returns: Updated status information

- **Update Profile Picture**
  - Path: `/api/users/{userId}/profile-picture`
  - Method: `PATCH`
  - Description: Update user's profile picture
  - Returns: Updated user profile with new picture URL

- **Update User Roles**
  - Path: `/api/users/{userId}/roles`
  - Method: `PATCH`
  - Description: Update user roles and permissions
  - Returns: Updated user permissions

### Workspaces Controller
Manages workspace operations and member access.

- **Create Workspace**
  - Path: `/api/workspaces`
  - Method: `POST`
  - Description: Create a new workspace
  - Returns: Created workspace object

- **Get Workspaces**
  - Path: `/api/workspaces`
  - Method: `GET`
  - Description: List all available workspaces
  - Returns: Array of workspace objects

- **Get Workspace**
  - Path: `/api/workspaces/{workspaceId}`
  - Method: `GET`
  - Description: Get detailed workspace information
  - Returns: Detailed workspace object

- **Update Workspace**
  - Path: `/api/workspaces/{workspaceId}`
  - Method: `PUT`
  - Description: Update workspace details
  - Returns: Updated workspace object

- **Delete Workspace**
  - Path: `/api/workspaces/{workspaceId}`
  - Method: `DELETE`
  - Description: Delete a workspace and its contents
  - Returns: Success confirmation

- **Get Workspace Users**
  - Path: `/api/workspaces/{workspaceId}/users`
  - Method: `GET`
  - Description: List workspace members
  - Returns: Array of user objects

- **Add Workspace User**
  - Path: `/api/workspaces/{workspaceId}/users`
  - Method: `POST`
  - Description: Add a new member to workspace
  - Returns: Updated workspace membership

- **Remove Workspace User**
  - Path: `/api/workspaces/{workspaceId}/users/{userId}`
  - Method: `DELETE`
  - Description: Remove a member from workspace
  - Returns: Updated workspace membership

- **Get Workspace Channels**
  - Path: `/api/workspaces/{workspaceId}/channels`
  - Method: `GET`
  - Description: List all channels in a workspace
  - Returns: Array of channel objects

### Channels Controller
Manages communication channels within workspaces.

- **Create Channel**
  - Path: `/api/channels`
  - Method: `POST`
  - Description: Create a new channel in a workspace
  - Returns: Created channel object

- **Get Channels**
  - Path: `/api/channels`
  - Method: `GET`
  - Description: List all available channels
  - Returns: Array of channel objects

- **Get Channel**
  - Path: `/api/channels/{channelId}`
  - Method: `GET`
  - Description: Get detailed channel information
  - Returns: Detailed channel object

- **Update Channel**
  - Path: `/api/channels/{channelId}`
  - Method: `PUT`
  - Description: Update channel details
  - Returns: Updated channel object

- **Delete Channel**
  - Path: `/api/channels/{channelId}`
  - Method: `DELETE`
  - Description: Delete a channel
  - Returns: Success confirmation

- **Get Channel Members**
  - Path: `/api/channels/{channelId}/members`
  - Method: `GET`
  - Description: List channel members
  - Returns: Array of user objects

- **Add Channel Member**
  - Path: `/api/channels/{channelId}/members`
  - Method: `POST`
  - Description: Add a new member to channel
  - Returns: Updated channel membership

- **Remove Channel Member**
  - Path: `/api/channels/{channelId}/members/{userId}`
  - Method: `DELETE`
  - Description: Remove a member from channel
  - Returns: Updated channel membership

### Messages Controller
Handles message operations and reactions.

- **Create Message**
  - Path: `/api/messages`
  - Method: `POST`
  - Description: Send a new message
  - Returns: Created message object

- **Get Message**
  - Path: `/api/messages/{messageId}`
  - Method: `GET`
  - Description: Get message details
  - Returns: Detailed message object

- **Update Message**
  - Path: `/api/messages/{messageId}`
  - Method: `PUT`
  - Description: Edit message content
  - Returns: Updated message object

- **Delete Message**
  - Path: `/api/messages/{messageId}`
  - Method: `DELETE`
  - Description: Delete a message
  - Returns: Success confirmation

- **Get Message Reactions**
  - Path: `/api/messages/{messageId}/reactions`
  - Method: `GET`
  - Description: List all reactions to a message
  - Returns: Array of reaction objects

- **Add Message Reaction**
  - Path: `/api/messages/{messageId}/reactions`
  - Method: `POST`
  - Description: Add an emoji reaction
  - Returns: Created reaction object

- **Remove Message Reaction**
  - Path: `/api/messages/{messageId}/reactions/{emojiId}`
  - Method: `DELETE`
  - Description: Remove an emoji reaction
  - Returns: Success confirmation

### Threads Controller
Manages message threads and replies.

- **Create Thread**
  - Path: `/api/threads`
  - Method: `POST`
  - Description: Start a new message thread
  - Returns: Created thread object

- **Get Thread**
  - Path: `/api/threads/{threadId}`
  - Method: `GET`
  - Description: Get thread details and messages
  - Returns: Thread object with messages

- **Create Thread Message**
  - Path: `/api/threads/{threadId}/messages`
  - Method: `POST`
  - Description: Add a message to a thread
  - Returns: Created message object

- **Get Thread Messages**
  - Path: `/api/threads/{threadId}/messages`
  - Method: `GET`
  - Description: List all messages in a thread
  - Returns: Array of message objects

- **Delete Thread Message**
  - Path: `/api/threads/{threadId}/messages/{messageId}`
  - Method: `DELETE`
  - Description: Delete a message from a thread
  - Returns: Success confirmation

- **Get Thread Participants**
  - Path: `/api/threads/{threadId}/participants`
  - Method: `GET`
  - Description: List thread participants
  - Returns: Array of user objects

### Emojis Controller
Manages custom emoji support.

- **Get Emojis**
  - Path: `/api/emojis`
  - Method: `GET`
  - Description: List all available emojis
  - Returns: Array of emoji objects

- **Create Emoji**
  - Path: `/api/emojis`
  - Method: `POST`
  - Description: Add a custom emoji
  - Returns: Created emoji object

- **Delete Emoji**
  - Path: `/api/emojis/{emojiId}`
  - Method: `DELETE`
  - Description: Remove a custom emoji
  - Returns: Success confirmation

- **Get Emoji**
  - Path: `/api/emojis/{emojiId}`
  - Method: `GET`
  - Description: Get emoji details
  - Returns: Detailed emoji object

### Files Controller
Handles file uploads and management.

- **Upload File**
  - Path: `/api/files`
  - Method: `POST`
  - Description: Upload a new file
  - Returns: Uploaded file object with URL

- **Get File**
  - Path: `/api/files/{fileId}`
  - Method: `GET`
  - Description: Download a file
  - Returns: File data stream

- **Get File Metadata**
  - Path: `/api/files/{fileId}/metadata`
  - Method: `GET`
  - Description: Get file information
  - Returns: File metadata object

- **Delete File**
  - Path: `/api/files/{fileId}`
  - Method: `DELETE`
  - Description: Delete a file
  - Returns: Success confirmation

- **Update File**
  - Path: `/api/files/{fileId}/update`
  - Method: `PUT`
  - Description: Update file metadata
  - Returns: Updated file object

## Authentication
All endpoints except user creation and login require authentication. The API uses session-based authentication with the following characteristics:

- Session cookies are used for maintaining authentication state
- Sessions are stored in Memorystore
- Protected endpoints return 401 Unauthorized if accessed without valid session
- Sessions expire after period of inactivity

## Rate Limiting
The API implements rate limiting to prevent abuse:

- Rate limits are applied per IP address
- Limits vary by endpoint type
- Exceeded limits return 429 Too Many Requests

## Error Handling
The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "error": {
    "message": "Description of the error",
    "code": "ERROR_CODE"
  }
}
```

## WebSocket Events
Real-time updates are provided through WebSocket connections:

- Message created/updated/deleted
- Channel member presence changes
- Reaction added/removed
- Thread updates
- Typing indicators

## API Versioning
The current API version is v1, included in the base path: `/api/v1/*`
Future versions will be introduced with separate base paths.
