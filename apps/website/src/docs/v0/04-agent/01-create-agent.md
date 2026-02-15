---
id: v0-create-agent
title: "createAgent"
description: "Set up createAgent with workflow sources, runtime config, and provider wiring."
keywords: [kortyx, createAgent, workflow-registry, config, runtime]
sidebar_label: "createAgent"
---
# createAgent

`createAgent` is the high-level entrypoint for chat orchestration.

## Minimal usage

```ts
import {
  createAgent,
  createInMemoryWorkflowRegistry,
  getProvider,
  initializeProviders,
} from "kortyx";
import { generalChatWorkflow } from "@/workflows/general-chat.workflow";

const registry = createInMemoryWorkflowRegistry([generalChatWorkflow], {
  fallbackId: "general-chat",
});

export const agent = createAgent({
  workflowRegistry: registry,
  loadRuntimeConfig: (options?: { sessionId?: string }) => ({
    session: { id: options?.sessionId ?? "anonymous-session" },
    ai: { googleApiKey: process.env.GOOGLE_API_KEY },
  }),
  getProvider,
  initializeProviders,
  fallbackWorkflowId: "general-chat",
});
```

## Workflow source resolution

`createAgent` can resolve workflows from:

1. `selectWorkflow` function
2. `workflowRegistry`
3. `workflowsDir`
4. fallback default: `./src/workflows`

## Config knobs

Useful fields in `CreateAgentArgs`:

- `defaultWorkflowId`
- `fallbackWorkflowId`
- `frameworkAdapter`
- `memoryAdapter`
- `selectWorkflow` or `workflowRegistry`

Result object:

```ts
const response = await agent.processChat(messages, options);
```
