import { Router } from "express";
import * as setupController from "../controllers/setup.controller";

const router: Router = Router();

/**
 * Setup Routes
 * Public endpoint for user registration
 */

// POST /setup - Register a new user with email (no auth required)
router.post("/setup", setupController.registerUser);

export default router;
