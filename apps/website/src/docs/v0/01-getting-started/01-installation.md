---
id: v0-installation
title: "Installation"
description: "Install Kortyx, set required environment variables, and configure basic project settings."
keywords: [kortyx, installation, nodejs, pnpm, environment]
sidebar_label: "Installation"
---
# Installation

## Prerequisites

- Node.js 20+
- pnpm (recommended in this monorepo)

## Install the main package

```bash
pnpm add kortyx
```

If you prefer scoped packages, see [Package Overview](../08-packages/01-package-overview.md).

## Runtime dependency notes

`kortyx` already re-exports agent/runtime/hooks/providers/memory/stream APIs.

You still need provider credentials at runtime (for example Google):

```bash
export GOOGLE_API_KEY=your_key_here
```

Accepted by current provider setup:

- `GOOGLE_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `KORTYX_GOOGLE_API_KEY`
- `KORTYX_GEMINI_API_KEY`

## Optional: root config file

Create `kortyx.config.mjs` in your app root if you want automatic workflow directory discovery:

```js
export default {
  workflowsDir: "./src/workflows",
  fallbackWorkflowId: "general-chat",
  registry: {
    cache: true,
  },
};
```

This is consumed by `loadKortyxConfig` / `createAgent`.

