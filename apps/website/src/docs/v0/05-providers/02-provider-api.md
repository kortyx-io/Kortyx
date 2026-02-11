---
id: v0-provider-api
title: "Provider API"
description: "Reference provider contracts, key helper functions, and runtime error behavior."
keywords: [kortyx, provider-api, kortyxmodel, modeloptions, factory]
sidebar_label: "Provider API"
---
# Provider API

Provider contracts are exported from `@kortyx/providers`.

## Key types

```ts
interface ModelOptions {
  temperature?: number;
  streaming?: boolean;
}

interface KortyxModel {
  stream(messages: Array<HumanMessage | SystemMessage>): AsyncIterable<AIMessageChunk> | Promise<AsyncIterable<AIMessageChunk>>;
  invoke(messages: Array<HumanMessage | SystemMessage>): Promise<BaseMessage>;
  temperature: number;
  streaming: boolean;
}

type GetProviderFn = (
  providerId: string,
  modelId: string,
  options?: ModelOptions,
) => KortyxModel;
```

## Factory helpers

- `initializeProviders(config)`
- `getProvider(providerId, modelId, options?)`
- `hasProvider(providerId)`
- `getInitializedProviders()`
- `getAvailableModels(providerId)`
- `createGoogleProvider(apiKey)`

## Error behavior

`getProvider` throws when:

- provider is not initialized
- model id is unknown for the selected provider

This fail-fast behavior is useful during app startup and misconfiguration.

