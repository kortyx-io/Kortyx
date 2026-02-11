---
id: v0-memory-adapters
title: "Adapters"
description: "Use the MemoryAdapter contract and understand current backend implementation status."
keywords: [kortyx, memory-adapter, in-memory, redis, postgres]
sidebar_label: "Adapters"
---
# Adapters

`@kortyx/memory` defines `MemoryAdapter` for business memory.

## Interface

```ts
interface MemoryAdapter {
  save(sessionId: string, state: GraphState): Promise<void>;
  load(sessionId: string): Promise<GraphState | null>;
  delete(sessionId: string): Promise<void>;
}
```

## In-memory adapter (implemented)

```ts
import { createInMemoryAdapter } from "kortyx";

const memoryAdapter = createInMemoryAdapter({
  namespace: "my-app",
  ttlMs: 60 * 60 * 1000,
});
```

Behavior:

- namespace-scoped shared map
- optional TTL pruning on access
- good for local development and tests

## Redis/Postgres adapters (current state)

These constructors exist but currently throw `not implemented yet` on use:

- `createRedisAdapter({ url, ... })`
- `createPostgresAdapter({ connectionString, ... })`

If you need production business memory today, either:

1. implement your own `MemoryAdapter`
2. patch these adapters in your app fork

## Pending request helpers

`@kortyx/memory` also exports in-memory pending request helpers:

- `savePendingRequest`
- `getPendingRequest`
- `updatePendingRequest`
- `deletePendingRequest`

For agent/runtime interrupt flow, prefer framework adapter stores from `@kortyx/runtime`.

