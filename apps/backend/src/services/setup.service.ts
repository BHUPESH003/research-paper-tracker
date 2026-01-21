import { prisma } from "../db/prisma";
import { hashApiKey } from "../utils/hash";
import crypto from "crypto";

/**
 * Setup Service
 *
 * Handles initial user setup and API key registration
 */

/**
 * Generate a unique API key based on email
 * Uses email + timestamp + random bytes for uniqueness
 */
function generateApiKey(email: string): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const combined = `${email}-${timestamp}-${randomBytes}`;
  return crypto.createHash("sha256").update(combined).digest("hex");
}

/**
 * Register a new user with their email
 * Generates and returns an API key for the user
 */
export async function registerUser(email: string) {
  // Check if email already exists
  const existingUser = await prisma.userAccessKey.findUnique({
    where: { email },
    select: { id: true, hashedKey: true }
  });

  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  // Generate a new API key
  const apiKey = generateApiKey(email);
  const hashedKey = hashApiKey(apiKey);

  // Create new user access key
  const userKey = await prisma.userAccessKey.create({
    data: {
      email,
      hashedKey
    },
    select: {
      id: true
    }
  });

  return { 
    id: userKey.id,
    apiKey // Return the plain API key to show to user (only time we return it)
  };
}
