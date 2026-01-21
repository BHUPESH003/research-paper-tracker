import { Router, Request, Response } from "express";
import { sendResponse } from "../utils/response";

const router: Router = Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get("/health", (_req: Request, res: Response) => {
  sendResponse(
    res,
    200,
    "HEALTH_OK",
    null,
    "Service is healthy"
  );
});

export default router;
