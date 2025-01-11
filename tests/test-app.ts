import express from "express";
import fileUpload from "express-fileupload";
import { registerRoutes } from "../server/routes";
import { setupAuth } from "../server/auth";
import session from "express-session";
import MemoryStore from "memorystore";

// Create Express app for testing
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup session middleware with memory store
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
}));

// File upload middleware - match production configuration
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Setup auth and routes
setupAuth(app);
const server = registerRoutes(app);

// Add server cleanup function using async/await pattern
afterAll(async () => {
  return new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
});

export { app };