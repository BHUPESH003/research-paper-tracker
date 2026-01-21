import express, { Application } from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import setupRoutes from "./routes/setup.routes";
import paperRoutes from "./routes/paper.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { errorHandler } from "./middleware/errorHandler";

/**
 * Initialize and configure Express application
 */
export function createApp(): Application {
  const app: Application = express();

  // Enable JSON parsing
  app.use(express.json());

  // Enable CORS
  app.use(cors());


  // Register routes
  app.use(healthRoutes);
  app.use(setupRoutes); // Public setup endpoint
  app.use(paperRoutes);
  app.use(analyticsRoutes);

  // Register global error handler (must be last)
  app.use(errorHandler);

  return app;
}
