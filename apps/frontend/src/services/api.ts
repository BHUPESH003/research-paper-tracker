import { ApiResponse } from "shared";

/**
 * API Client
 * 
 * Centralized HTTP client for backend communication.
 * Handles API key injection, response parsing, and error normalization.
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// API Key Storage
let apiKey: string | null = null;

// Initialize API key from localStorage on module load
if (typeof window !== 'undefined') {
  const storedKey = localStorage.getItem("RPT_API_KEY");
  if (storedKey) {
    apiKey = storedKey;
  }
}

/**
 * Set the API key for all subsequent requests
 */
export function setApiKey(key: string): void {
  apiKey = key;
}

/**
 * Get the current API key
 */
export function getApiKey(): string | null {
  return apiKey;
}

/**
 * Clear the API key
 */
export function clearApiKey(): void {
  apiKey = null;
}

/**
 * API Error class
 * Thrown when API returns an error response
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Build headers for API requests
 */
function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers["X-API-KEY"] = apiKey;
  }

  return headers;
}

/**
 * Parse and validate API response
 */
async function parseResponse<T>(response: Response): Promise<T> {
  // Check if response is OK (status 200-299)
  if (!response.ok) {
    // Try to parse error response
    try {
      const errorData: ApiResponse<null> = await response.json();
      
      // Validate error response structure
      if (errorData.code && errorData.message) {
        throw new ApiError(errorData.code, errorData.message);
      }
      
      // Fallback if error response doesn't match expected format
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // If JSON parsing fails, throw generic error
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Parse successful response
  const data: ApiResponse<T> = await response.json();

  // Validate response structure
  if (!data.hasOwnProperty("code") || !data.hasOwnProperty("data") || !data.hasOwnProperty("message")) {
    throw new Error("Invalid API response format");
  }

  // Return the data payload
  return data.data;
}

/**
 * Make a GET request
 */
export async function get<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: buildHeaders()
    });

    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error("Unknown network error");
  }
}

/**
 * Make a POST request
 */
export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body)
    });

    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error("Unknown network error");
  }
}

/**
 * Make a PATCH request
 */
export async function patch<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: buildHeaders(),
      body: JSON.stringify(body)
    });

    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error("Unknown network error");
  }
}
