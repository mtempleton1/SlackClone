# Slack-like Backend API Documentation

## Project Overview
This project implements a comprehensive backend API for a Slack-like communication platform, providing full support for real-time messaging and collaborative communication features. The API enables creation and management of workspaces, channels, messages, threads, user profiles, and file sharing capabilities.

## Technical Stack

### Core Technologies
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: Socket.IO
- **Authentication**: Passport.js with Local Strategy

### Key Dependencies
- **Web Framework**: Express.js (^4.21.2)
- **Database ORM**: Drizzle ORM (^0.38.2)
- **WebSocket**: Socket.IO, WS (^8.18.0)
- **Authentication**: Passport (^0.7.0), Passport-Local (^1.0.38)
- **Session Management**: Express-Session (^1.18.1)
- **Data Validation**: Zod (^3.23.8)
- **File Upload**: Express-FileUpload
- **Date Handling**: date-fns (^3.6.0)

### Frontend Technologies (Client Application)
- **Framework**: React (^18.3.1)
- **Routing**: Wouter (^3.3.5)
- **State Management**: @tanstack/react-query (^5.60.5)
- **UI Components**: Various Radix UI components
- **Styling**: TailwindCSS (^3.4.14)

## API Endpoints

### Users Controller
Manages user accounts and profile information.

* **POST /api/users**
  - Purpose: Create a new user account
  - Description: Creates a new user with profile information including email and display name
  - Returns: Created user object with profile details

* **GET /api/users**
  - Purpose: List all users
  - Description: Retrieves a list of all user accounts in the system
  - Returns: Array of user objects with basic profile information

* **GET /api/users/{userId}**
  - Purpose: Get user details
  - Description: Retrieves detailed information for a specific user
  - Returns: Detailed user object including profile settings

* **PUT /api/users/{userId}**
  - Purpose: Update user profile
  - Description: Updates profile information for a specific user
  - Returns: Updated user object

* **DELETE /api/users/{userId}**
  - Purpose: Delete user account
  - Description: Removes a user account from the system
  - Returns: Success confirmation

* **PATCH /api/users/{userId}/status**
  - Purpose: Update user status
  - Description: Updates the online presence status of a user
  - Returns: Updated user status object

* **PATCH /api/users/{userId}/profile-picture**
  - Purpose: Update profile picture
  - Description: Updates or changes the user's profile picture
  - Returns: Updated user profile with new picture URL

* **PATCH /api/users/{userId}/roles**
  - Purpose: Update user roles
  - Description: Modifies the user's system roles and permissions
  - Returns: Updated user roles object

### Workspaces Controller
Manages organization workspaces and their members.

* **POST /api/workspaces**
  - Purpose: Create workspace
  - Description: Creates a new workspace with specified parameters
  - Returns: Created workspace object

* **GET /api/workspaces**
  - Purpose: List workspaces
  - Description: Retrieves all accessible workspaces
  - Returns: Array of workspace objects

* **GET /api/workspaces/{workspaceId}**
  - Purpose: Get workspace details
  - Description: Retrieves detailed information about a specific workspace
  - Returns: Detailed workspace object

* **PUT /api/workspaces/{workspaceId}**
  - Purpose: Update workspace
  - Description: Updates workspace details
  - Returns: Updated workspace object

* **DELETE /api/workspaces/{workspaceId}**
  - Purpose: Delete workspace
  - Description: Removes a workspace and its associated data
  - Returns: Success confirmation

* **GET /api/workspaces/{workspaceId}/users**
  - Purpose: List workspace members
  - Description: Lists all members of a workspace
  - Returns: Array of user objects

* **POST /api/workspaces/{workspaceId}/users**
  - Purpose: Add workspace member
  - Description: Adds a new user to the workspace
  - Returns: Updated workspace membership

* **DELETE /api/workspaces/{workspaceId}/users/{userId}**
  - Purpose: Remove workspace member
  - Description: Removes a user from the workspace
  - Returns: Success confirmation

### Channels Controller
Manages communication channels within workspaces.

* **POST /api/channels**
  - Purpose: Create channel
  - Description: Creates a new channel in a workspace
  - Returns: Created channel object

* **GET /api/channels**
  - Purpose: List channels
  - Description: Retrieves all accessible channels
  - Returns: Array of channel objects

* **GET /api/channels/{channelId}**
  - Purpose: Get channel details
  - Description: Retrieves detailed information about a specific channel
  - Returns: Detailed channel object

* **PUT /api/channels/{channelId}**
  - Purpose: Update channel
  - Description: Updates channel details
  - Returns: Updated channel object

* **DELETE /api/channels/{channelId}**
  - Purpose: Delete channel
  - Description: Removes a channel and its messages
  - Returns: Success confirmation

* **GET /api/channels/{channelId}/members**
  - Purpose: List channel members
  - Description: Lists all members of a channel
  - Returns: Array of user objects

* **POST /api/channels/{channelId}/members**
  - Purpose: Add channel member
  - Description: Adds a new member to the channel
  - Returns: Updated channel membership

* **DELETE /api/channels/{channelId}/members/{userId}**
  - Purpose: Remove channel member
  - Description: Removes a member from the channel
  - Returns: Success confirmation

### Messages Controller
Handles message operations and reactions.

* **POST /api/messages**
  - Purpose: Create message
  - Description: Sends a new message in a channel
  - Returns: Created message object

* **GET /api/messages/{messageId}**
  - Purpose: Get message
  - Description: Retrieves a specific message
  - Returns: Message object with details

* **PUT /api/messages/{messageId}**
  - Purpose: Update message
  - Description: Modifies an existing message
  - Returns: Updated message object

* **DELETE /api/messages/{messageId}**
  - Purpose: Delete message
  - Description: Removes a message
  - Returns: Success confirmation

* **GET /api/messages/{messageId}/reactions**
  - Purpose: List message reactions
  - Description: Gets all reactions to a message
  - Returns: Array of reaction objects

* **POST /api/messages/{messageId}/reactions**
  - Purpose: Add reaction
  - Description: Adds an emoji reaction to a message
  - Returns: Updated message reactions

* **DELETE /api/messages/{messageId}/reactions/{emojiId}**
  - Purpose: Remove reaction
  - Description: Removes an emoji reaction from a message
  - Returns: Updated message reactions

### Threads Controller
Manages message threads and replies.

* **POST /api/threads**
  - Purpose: Create thread
  - Description: Starts a new message thread
  - Returns: Created thread object

* **GET /api/threads/{threadId}**
  - Purpose: Get thread
  - Description: Retrieves a specific thread and its messages
  - Returns: Thread object with messages

* **POST /api/threads/{threadId}/messages**
  - Purpose: Add thread message
  - Description: Adds a new message to a thread
  - Returns: Created thread message

* **DELETE /api/threads/{threadId}/messages/{messageId}**
  - Purpose: Delete thread message
  - Description: Removes a message from a thread
  - Returns: Success confirmation

* **GET /api/threads/{threadId}/participants**
  - Purpose: List participants
  - Description: Lists all participants in a thread
  - Returns: Array of user objects

### Files Controller
Manages file uploads and attachments.

* **POST /api/files**
  - Purpose: Upload file
  - Description: Uploads a new file to the system
  - Returns: Uploaded file metadata

* **GET /api/files/{fileId}**
  - Purpose: Download file
  - Description: Downloads a specific file
  - Returns: File data

* **GET /api/files/{fileId}/metadata**
  - Purpose: Get file metadata
  - Description: Retrieves metadata about a file
  - Returns: File metadata object

* **DELETE /api/files/{fileId}**
  - Purpose: Delete file
  - Description: Removes a file from the system
  - Returns: Success confirmation

* **PUT /api/files/{fileId}/update**
  - Purpose: Update file
  - Description: Updates file metadata or contents
  - Returns: Updated file metadata

### Emojis Controller
Manages custom emoji support.

* **GET /api/emojis**
  - Purpose: List emojis
  - Description: Lists all available emojis
  - Returns: Array of emoji objects

* **POST /api/emojis**
  - Purpose: Add custom emoji
  - Description: Adds a new custom emoji
  - Returns: Created emoji object

* **DELETE /api/emojis/{emojiId}**
  - Purpose: Delete emoji
  - Description: Removes a custom emoji
  - Returns: Success confirmation

* **GET /api/emojis/{emojiId}**
  - Purpose: Get emoji details
  - Description: Retrieves details about a specific emoji
  - Returns: Emoji object with details

## Authentication
The API uses session-based authentication with Passport.js. All endpoints except for user creation and authentication endpoints require valid session cookies obtained through the login process.

## Real-time Features
The application uses Socket.IO for real-time features such as:
- Instant messaging
- Presence updates
- Typing indicators
- Message reactions
- Thread notifications

## Rate Limiting
API endpoints are protected by rate limiting to prevent abuse. Limits vary by endpoint and user role.

## Error Handling
The API uses standard HTTP status codes and returns error responses in the following format:
```json
{
  "message": "Error description"
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
