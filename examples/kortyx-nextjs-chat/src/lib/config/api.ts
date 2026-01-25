/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    chat: string;
  };
  timeout: number;
}

// Environment-based configuration
const getApiConfig = (): ApiConfig => {
  // Default to backend server port (6200 in development, 4000 is fallback)

  const baseUrl =
    process.env.NEXT_PUBLIC_KORTYX_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    // During build time, use a placeholder that will be replaced at runtime
    console.warn(
      "NEXT_PUBLIC_KORTYX_API_URL not set during build, using placeholder",
    );
    return {
      // Default to chat-api dev port
      baseUrl: "http://localhost:6200",
      endpoints: {
        chat: "/v1/chat",
      },
      timeout: 30000, // 30 seconds
    };
  }

  return {
    baseUrl,
    endpoints: {
      chat: "/v1/chat",
    },
    timeout: 30000, // 30 seconds
  };
};

export const apiConfig = getApiConfig();

// Helper function to build full API URLs
export const buildApiUrl = (
  endpoint: string,
  params?: Record<string, string>,
): string => {
  const url = new URL(endpoint, apiConfig.baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

// Specific API URLs
export const API_URLS = {
  chat: buildApiUrl(apiConfig.endpoints.chat),
  chatStreaming: buildApiUrl(apiConfig.endpoints.chat, { stream: "true" }),
} as const;
