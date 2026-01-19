import { createGoogleProvider } from "./providers/google";
import type {
  GetProviderFn,
  KortyxModel,
  ModelOptions,
  ProviderConfig,
  ProviderFactoryConfig,
} from "./types";

/**
 * Provider registry that holds initialized providers
 */
let providers: Record<string, ProviderConfig> = {};

/**
 * Initialize providers with API keys.
 * Call this once at application startup.
 *
 * @param config - API keys for various providers
 */
export function initializeProviders(config: ProviderFactoryConfig): void {
  providers = {};

  // Initialize Google provider if API key is available
  if (config.googleApiKey) {
    providers.google = createGoogleProvider(config.googleApiKey);
  }

  // TODO: Add OpenAI provider when needed
  // if (config.openaiApiKey) {
  //   providers.openai = createOpenAIProvider(config.openaiApiKey);
  // }

  // TODO: Add Anthropic provider when needed
  // if (config.anthropicApiKey) {
  //   providers.anthropic = createAnthropicProvider(config.anthropicApiKey);
  // }
}

/**
 * Get a model instance from a provider.
 * This is the main function used by the runtime.
 *
 * @param providerId - The provider ID (e.g., "google", "openai")
 * @param modelId - The model ID (e.g., "gemini-2.5-flash", "gpt-4")
 * @param options - Optional model configuration
 * @returns A KortyxModel instance
 * @throws Error if provider or model is not found
 */
export const getProvider: GetProviderFn = (
  providerId: string,
  modelId: string,
  options?: ModelOptions,
): KortyxModel => {
  const provider = providers[providerId];
  if (!provider) {
    throw new Error(
      `Provider '${providerId}' not initialized. Check API key configuration.`,
    );
  }

  const modelFactory = provider.models[modelId];
  if (!modelFactory) {
    const availableModels = Object.keys(provider.models).join(", ");
    throw new Error(
      `Unknown model: ${modelId} for provider ${providerId}. Available models: ${availableModels}`,
    );
  }

  const model = modelFactory();

  // Apply runtime options
  if (options?.temperature !== undefined) {
    model.temperature = options.temperature;
  }

  if (options?.streaming !== undefined) {
    model.streaming = options.streaming;
  }

  return model;
};

/**
 * Check if a provider is initialized
 */
export function hasProvider(providerId: string): boolean {
  return providerId in providers;
}

/**
 * Get list of initialized provider IDs
 */
export function getInitializedProviders(): string[] {
  return Object.keys(providers);
}

/**
 * Get list of available models for a provider
 */
export function getAvailableModels(providerId: string): string[] {
  const provider = providers[providerId];
  if (!provider) {
    return [];
  }
  return Object.keys(provider.models);
}
