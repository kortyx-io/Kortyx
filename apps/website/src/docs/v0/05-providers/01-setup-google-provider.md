---
id: v0-setup-google-provider
title: "Setup (Google)"
description: "Initialize and use the built-in Google provider currently supported by Kortyx."
keywords: [kortyx, google, gemini, provider-setup, getProvider]
sidebar_label: "Setup (Google)"
---
# Setup (Google)

Current OSS provider implementation supports Google models out of the box.

## 1. Initialize providers

```ts
import { initializeProviders } from "kortyx";

initializeProviders({
  googleApiKey: process.env.GOOGLE_API_KEY,
});
```

## 2. Resolve a model

```ts
import { getProvider } from "kortyx";

const model = getProvider("google", "gemini-2.5-flash", {
  temperature: 0.3,
  streaming: true,
});
```

## 3. Use inside nodes via `useAiProvider`

```ts
import { useAiProvider } from "kortyx";

const llm = useAiProvider("google:gemini-2.5-flash");
const res = await llm.call({ prompt: "Hello" });
```

## Available built-in Google model ids

- `gemini-2.5-flash`
- `gemini-2.0-flash`
- `gemini-1.5-pro`
- `gemini-1.5-flash`

## Important current limitation

`initializeProviders` accepts OpenAI/Anthropic keys in the type, but only Google is currently wired in factory code.

