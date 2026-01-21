import crypto from "crypto";

/**
 * Hash utility for API keys
 * Uses SHA-256 one-way hashing
 */

/**
 * Hash a plaintext API key using SHA-256
 * @param apiKey - The plaintext API key
 * @returns The hashed key as a hex string
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}
