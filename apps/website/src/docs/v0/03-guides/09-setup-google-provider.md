---
id: v0-setup-google-provider
title: "Setup (Google)"
description: "Install and initialize the Google provider package, then use model refs directly in nodes/workflows."
keywords: [kortyx, google, gemini, provider-setup]
sidebar_label: "Setup (Google)"
---
# Setup (Google)

Google provider support lives in a dedicated package.

## 1. Install provider package

```bash tabs="install-google-provider" tab="pnpm"
pnpm add @kortyx/google
```

```bash tabs="install-google-provider" tab="npm"
npm install @kortyx/google
```

```bash tabs="install-google-provider" tab="yarn"
yarn add @kortyx/google
```

```bash tabs="install-google-provider" tab="bun"
bun add @kortyx/google
```

## 2. Initialize provider once in app bootstrap

```ts
// src/lib/providers.ts
import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
  MODELS,
  PROVIDER_ID,
} from "@kortyx/google";

const googleApiKey = process.env.GOOGLE_API_KEY;

let googleProvider: GoogleGenerativeAIProvider | undefined;

export const ensureGoogleProvider = (): GoogleGenerativeAIProvider => {
  if (!googleProvider) {
    if (!googleApiKey) {
      throw new Error("Missing Google provider API key.");
    }
    googleProvider = createGoogleGenerativeAI({ apiKey: googleApiKey });
  }
  return googleProvider;
};

export const google: GoogleGenerativeAIProvider = ((modelId, options) =>
  ensureGoogleProvider()(modelId, options)) as GoogleGenerativeAIProvider;

google.id = PROVIDER_ID;
google.models = MODELS;
```

```js
// src/lib/providers.js
import { createGoogleGenerativeAI, MODELS, PROVIDER_ID } from "@kortyx/google";

const googleApiKey = process.env.GOOGLE_API_KEY;

let googleProvider;

export const ensureGoogleProvider = () => {
  if (!googleProvider) {
    if (!googleApiKey) {
      throw new Error("Missing Google provider API key.");
    }
    googleProvider = createGoogleGenerativeAI({ apiKey: googleApiKey });
  }
  return googleProvider;
};

export const google = (modelId, options) =>
  ensureGoogleProvider()(modelId, options);

google.id = PROVIDER_ID;
google.models = MODELS;
```

## 3. Use model refs in workflow/node params

```ts
// workflow params
params: {
  model: google("gemini-2.5-flash"),
  temperature: 0.3,
}
```

```js
// workflow params
params: {
  model: google("gemini-2.5-flash"),
  temperature: 0.3,
}
```

## 4. Call the model from nodes with `useReason(...)`

```ts
import { useReason } from "kortyx";

const result = await useReason({
  model: params.model,
  input: String(input ?? ""),
  temperature: params.temperature ?? 0.3,
  emit: true,
  stream: true,
});
```

```js
import { useReason } from "kortyx";

const result = await useReason({
  model: params.model,
  input: String(input ?? ""),
  temperature: params.temperature ?? 0.3,
  emit: true,
  stream: true,
});
```

> **Good to know:** You do not configure providers on `createAgent`. Provider initialization is app-owned, and models are selected at node/workflow level.

## Available built-in Google model ids

- `gemini-2.5-flash`
- `gemini-2.0-flash`
- `gemini-1.5-pro`
- `gemini-1.5-flash`
