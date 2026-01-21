import { useState, useEffect } from "react";
import { setApiKey } from "../services/api";

/**
 * useApiKey Hook
 * 
 * Manages API key lifecycle:
 * - Generates UUID v4 key on first use
 * - Persists key in localStorage
 * - Allows import/export for key management
 * - Automatically injects key into API client
 */

const STORAGE_KEY = "RPT_API_KEY";

export interface UseApiKeyReturn {
  apiKey: string | null;
  isReady: boolean;
  generateKey: () => void;
  importKey: (key: string) => void;
  exportKey: () => string | null;
}

/**
 * Generate a new UUID v4 API key
 */
function generateNewKey(): string {
  return crypto.randomUUID();
}

/**
 * Load API key from localStorage
 */
function loadKeyFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable (SSR, private mode, quota exceeded)
    return null;
  }
}

/**
 * Save API key to localStorage
 */
function saveKeyToStorage(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Custom hook for API key management
 */
export function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Initialize API key on mount
  useEffect(() => {
    const key = loadKeyFromStorage();

    // Update local state
    setApiKeyState(key);

    // Inject into API client if key exists
    if (key) {
      setApiKey(key);
    }

    // Mark as ready
    setIsReady(true);
  }, []);

  /**
   * Generate and store a new API key
   */
  const generateKey = (): void => {
    const key = generateNewKey();
    saveKeyToStorage(key);
    setApiKeyState(key);
    setApiKey(key);
  };

  /**
   * Import an existing API key
   * Validates non-empty string before storing
   */
  const importKey = (key: string): void => {
    // Validate non-empty
    if (!key || key.trim().length === 0) {
      return;
    }

    const trimmedKey = key.trim();
    saveKeyToStorage(trimmedKey);
    setApiKeyState(trimmedKey);
    setApiKey(trimmedKey);
  };

  /**
   * Export the current API key
   */
  const exportKey = (): string | null => {
    return apiKey;
  };

  return {
    apiKey,
    isReady,
    generateKey,
    importKey,
    exportKey
  };
}
