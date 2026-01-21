/**
 * Extend Express Request type to include authenticated user context
 */
declare global {
  namespace Express {
    interface Request {
      userKey: {
        id: string;
      };
    }
  }
}

export {};
