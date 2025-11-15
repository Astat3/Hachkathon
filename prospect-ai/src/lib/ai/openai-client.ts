import OpenAI from "openai";

// Validate API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration constants
export const AI_CONFIG = {
  model: "gpt-4" as const,
  temperature: 0.7,
  maxTokens: 1000,
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
} as const;

// Retry logic for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = AI_CONFIG.maxRetries,
  delay: number = AI_CONFIG.retryDelay
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof OpenAI.APIError) {
        // Don't retry on authentication or invalid request errors
        if (error.status === 401 || error.status === 400) {
          throw error;
        }
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// Helper to check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
