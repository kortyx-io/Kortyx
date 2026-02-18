---
id: v0-create-agent
title: "createAgent"
description: "Set up createAgent with strict workflow/runtime config and explicit provider wiring in nodes."
keywords: [kortyx, createAgent, workflow-registry, config, runtime, strict]
sidebar_label: "createAgent"
---
# createAgent

`createAgent` is the high-level entrypoint for chat orchestration.

## Minimal usage

```ts
import { createAgent } from "kortyx";
import { generalChatWorkflow } from "@/workflows/general-chat.workflow";

export const agent = createAgent({
  workflows: [generalChatWorkflow],
  session: {
    id: "anonymous-session",
  },
  fallbackWorkflowId: "general-chat",
});
```

```js
import { createAgent } from "kortyx";
import { generalChatWorkflow } from "@/workflows/general-chat.workflow";

export const agent = createAgent({
  workflows: [generalChatWorkflow],
  session: {
    id: "anonymous-session",
  },
  fallbackWorkflowId: "general-chat",
});
```

> **Good to know:** `createAgent` no longer accepts `ai: {...}`. Initialize providers in app bootstrap and pass model refs inside node params.

## Workflow source resolution

`createAgent` can resolve workflows from:

1. `workflowRegistry`
2. `workflows`
3. `workflowsDir`
4. fallback default: `./src/workflows`

Only one of `workflowRegistry`, `workflows`, or `workflowsDir` is allowed in the same config.

## Config knobs

Useful fields in `CreateAgentArgs`:

- `workflows` / `workflowRegistry` / `workflowsDir`
- `session`
- `memory`
- `defaultWorkflowId`
- `fallbackWorkflowId`
- `frameworkAdapter`
- `getProvider` (advanced: custom provider registry lookup)

Result object:

```ts
const response = await agent.processChat(messages, options);
```
