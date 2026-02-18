---
id: v0-runtime-hooks
title: "Hooks"
description: "Use Kortyx hooks for reasoning, interrupts, memory access, structured data, and runtime state."
keywords: [kortyx, hooks, useReason, useInterrupt, useWorkflowState, useNodeState, useStructuredData]
sidebar_label: "Hooks"
---
# Hooks

Hooks are the public node-level runtime API (import from `kortyx`).

## `useReason(...)`

`useReason` is the primary LLM hook.

```ts
import { useReason } from "kortyx";
import { z } from "zod";
import { google } from "@/lib/providers";

const PlanSchema = z.object({
  summary: z.string(),
  checklist: z.array(z.string()),
  userChoice: z.string(),
});

const ChoiceRequestSchema = z.object({
  kind: z.enum(["choice", "multi-choice"]),
  question: z.string(),
  options: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
});

const ChoiceResponseSchema = z.union([
  z.string(),
  z.array(z.string()).min(1),
]);

const result = await useReason({
  id: "launch-plan",
  model: google("gemini-2.5-flash"),
  input: "Plan a one-week launch.",
  outputSchema: PlanSchema,
  structured: {
    dataType: "reason.plan",
    stream: "patch",
    schemaId: "reason-plan",
    schemaVersion: "1",
  },
  interrupt: {
    requestSchema: ChoiceRequestSchema,
    responseSchema: ChoiceResponseSchema,
    schemaId: "reason-choice",
    schemaVersion: "1",
  },
});
```

Behavior:

- First pass is a single model call that produces draft output and interrupt request.
- Runtime emits `interrupt` and pauses.
- Resume continues from the `useReason` checkpoint and runs the continuation pass.

## `useInterrupt({ request, ...schemas })`

Use this when you want fully manual interrupt payloads without LLM-generated request shaping.

```ts
import { useInterrupt } from "kortyx";

const selected = await useInterrupt({
  request: {
    kind: "choice",
    question: "Pick one",
    options: [
      { id: "a", label: "Alpha" },
      { id: "b", label: "Beta" },
    ],
  },
});
```

Return:

- `string` for `text` and `choice`
- `string[]` for `multi-choice`

## `useNodeState` and `useWorkflowState`

Node-local state:

```ts
const [idx, setIdx] = useNodeState(0);
```

Or keyed node-local state:

```ts
const [cursor, setCursor] = useNodeState("cursor", 0);
```

Workflow-shared state:

```ts
const [todos, setTodos] = useWorkflowState<string[]>("todos", []);
```

## `useEmit()` and `useStructuredData(...)`

```ts
const emit = useEmit();
emit("status", { message: "working" });

useStructuredData({
  dataType: "hooks",
  data: { step: "parse" },
});
```

`useStructuredData` emits `structured_data` from the current node context.

## `useAiMemory()`

Returns the configured `MemoryAdapter`. If none is configured, it throws.

```ts
const memory = useAiMemory();
await memory.save("session-1", state);
```

> **Good to know:** On resume, node code starts again from the top. `useReason` continues from its internal checkpoint, but code before `useReason` can run again. Keep `useReason` as the first meaningful operation and guard pre-`useReason` side effects with `useNodeState`.

```ts
const [started, setStarted] = useNodeState("started", false);

if (!started) {
  useStructuredData({ dataType: "lifecycle", mode: "snapshot", data: { step: "start" } });
  setStarted(true);
}

const result = await useReason({ ... });
setStarted(false);
```
