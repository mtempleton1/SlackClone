import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { WebSocketServer } from "ws";

// Controllers
import * as usersController from "./controllers/users";
import * as workspacesController from "./controllers/workspaces";
import * as channelsController from "./controllers/channels";
import * as messagesController from "./controllers/messages";
import * as threadsController from "./controllers/threads";
import * as emojisController from "./controllers/emojis";
import * as filesController from "./controllers/files";

export function registerRoutes(app: Express): Server {
  // Auth routes
  setupAuth(app);

  // Users endpoints
  app.post("/api/users", usersController.createUser);
  app.get("/api/users", isAuthenticated, usersController.getUsers);
  app.get("/api/users/:userId", isAuthenticated, usersController.getUser);
  app.put("/api/users/:userId", isAuthenticated, usersController.updateUser);
  app.delete("/api/users/:userId", isAuthenticated, usersController.deleteUser);
  app.patch("/api/users/:userId/status", isAuthenticated, usersController.updateUserStatus);
  app.patch("/api/users/:userId/profile-picture", isAuthenticated, usersController.updateProfilePicture);
  app.patch("/api/users/:userId/roles", isAuthenticated, usersController.updateUserRoles);

  // Workspaces endpoints
  app.post("/api/workspaces", isAuthenticated, workspacesController.createWorkspace);
  app.get("/api/workspaces", isAuthenticated, workspacesController.getWorkspaces);
  app.get("/api/workspaces/:workspaceId", isAuthenticated, workspacesController.getWorkspace);
  app.put("/api/workspaces/:workspaceId", isAuthenticated, workspacesController.updateWorkspace);
  app.delete("/api/workspaces/:workspaceId", isAuthenticated, workspacesController.deleteWorkspace);
  app.get("/api/workspaces/:workspaceId/users", isAuthenticated, workspacesController.getWorkspaceUsers);
  app.post("/api/workspaces/:workspaceId/users", isAuthenticated, workspacesController.addWorkspaceUser);
  app.delete("/api/workspaces/:workspaceId/users/:userId", isAuthenticated, workspacesController.removeWorkspaceUser);
  app.get("/api/workspaces/:workspaceId/channels", isAuthenticated, workspacesController.getWorkspaceChannels);

  // Channels endpoints
  app.post("/api/channels", isAuthenticated, channelsController.createChannel);
  app.get("/api/channels", isAuthenticated, channelsController.getChannels);
  app.get("/api/channels/:channelId", isAuthenticated, channelsController.getChannel);
  app.put("/api/channels/:channelId", isAuthenticated, channelsController.updateChannel);
  app.delete("/api/channels/:channelId", isAuthenticated, channelsController.deleteChannel);
  app.get("/api/channels/:channelId/members", isAuthenticated, channelsController.getChannelMembers);
  app.post("/api/channels/:channelId/members", isAuthenticated, channelsController.addChannelMember);
  app.delete("/api/channels/:channelId/members/:userId", isAuthenticated, channelsController.removeChannelMember);
  app.get("/api/channels/:channelId/messages", isAuthenticated, messagesController.getChannelMessages);

  // Messages endpoints
  app.post("/api/messages", isAuthenticated, messagesController.createMessage);
  app.get("/api/messages/:messageId", isAuthenticated, messagesController.getMessage);
  app.put("/api/messages/:messageId", isAuthenticated, messagesController.updateMessage);
  app.delete("/api/messages/:messageId", isAuthenticated, messagesController.deleteMessage);
  app.get("/api/messages/:messageId/reactions", isAuthenticated, messagesController.getMessageReactions);
  app.post("/api/messages/:messageId/reactions", isAuthenticated, messagesController.addMessageReaction);
  app.delete("/api/messages/:messageId/reactions/:emojiId", isAuthenticated, messagesController.removeMessageReaction);

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
    verifyClient: (info, cb) => {
      // Here you can add authentication verification
      // For now, we'll accept all connections
      cb(true);
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'message') {
          // Save the message to the database
          const { channelId, content } = message;
          const savedMessage = await messagesController.createMessage({
            body: { channelId, content },
            user: { id: 1 }, // TODO: Replace with actual user from session
          } as any, {
            json: (data: any) => data,
            status: () => ({ json: (data: any) => data })
          } as any);

          // Broadcast the saved message to all clients
          const broadcastMessage = {
            type: 'message',
            message: {
              ...savedMessage,
              sender: "User", // TODO: Get actual user info
              timestamp: new Date().toLocaleTimeString(),
              avatar: "https://github.com/shadcn.png" // TODO: Get actual user avatar
            }
          };

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocketServer.OPEN) {
              client.send(JSON.stringify(broadcastMessage));
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return httpServer;
}