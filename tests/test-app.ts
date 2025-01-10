import express from "express";
import { registerRoutes } from "../server/routes";
import { setupAuth } from "../server/auth";

// Create Express app for testing
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup auth and routes
setupAuth(app);
registerRoutes(app);

export { app };
