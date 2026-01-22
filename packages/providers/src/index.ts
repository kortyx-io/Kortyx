// release-test: 2026-01-22
/**
 * @kortyx/providers
 *
 * Kortyx-native provider system for AI models.
 * Provides a unified interface for different LLM providers (Google, OpenAI, Anthropic).
 */

// Factory
export {
  getAvailableModels,
  getInitializedProviders,
  getProvider,
  hasProvider,
  initializeProviders,
} from "./factory";
export type { GoogleModelId } from "./providers/google";
// Built-in providers
export { createGoogleProvider, GOOGLE_MODELS } from "./providers/google";
// Types
export type {
  GetProviderFn,
  KortyxModel,
  ModelFactory,
  ModelOptions,
  ProviderConfig,
  ProviderFactoryConfig,
} from "./types";
export { ProviderConfigSchema } from "./types";
