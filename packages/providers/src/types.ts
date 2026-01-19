import type {
  AIMessageChunk,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { z } from "zod";

/**
 * Options for model instantiation
 */
export interface ModelOptions {
  temperature?: number;
  streaming?: boolean;
}

/**
 * Normalized model interface that all providers must implement.
 * This abstracts away the underlying LLM provider (Google, OpenAI, etc.)
 */
export interface KortyxModel {
  /**
   * Stream responses from the model
   */
  stream: (
    messages: Array<HumanMessage | SystemMessage>,
  ) => AsyncIterable<AIMessageChunk> | Promise<AsyncIterable<AIMessageChunk>>;

  /**
   * Invoke the model synchronously (non-streaming)
   */
  invoke: (
    messages: Array<HumanMessage | SystemMessage>,
  ) => Promise<BaseMessage>;

  /**
   * Model temperature (can be modified at runtime)
   */
  temperature: number;

  /**
   * Whether streaming is enabled
   */
  streaming: boolean;
}

/**
 * Factory function that creates a model instance
 */
export type ModelFactory = () => KortyxModel;

/**
 * Configuration for a single provider (e.g., Google, OpenAI)
 */
export const ProviderConfigSchema = z.object({
  id: z.string(),
  models: z.record(z.function().returns(z.any())),
});

export type ProviderConfig = {
  id: string;
  models: Record<string, ModelFactory>;
};

/**
 * Configuration passed to createProviderFactory
 */
export interface ProviderFactoryConfig {
  googleApiKey?: string | undefined;
  openaiApiKey?: string | undefined;
  anthropicApiKey?: string | undefined;
}

/**
 * The function signature that runtime uses to get a provider.
 * This matches the interface expected by @kortyx/runtime's GraphRuntimeConfig.
 */
export type GetProviderFn = (
  providerId: string,
  modelId: string,
  options?: ModelOptions,
) => KortyxModel;
