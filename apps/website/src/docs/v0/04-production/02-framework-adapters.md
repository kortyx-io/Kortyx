---
id: v0-runtime-framework-adapters
title: "Framework Adapters"
description: "Configure in-memory or Redis framework adapters for checkpoints and interrupt resume."
keywords: [kortyx, framework-adapter, redis, checkpointer, ttl]
sidebar_label: "Framework Adapters"
---
# Framework Adapters

Framework adapters live in `@kortyx/runtime` and back resume/checkpoint internals.

## In-memory

```ts
import { createInMemoryFrameworkAdapter } from "kortyx";

const frameworkAdapter = createInMemoryFrameworkAdapter({
  ttlMs: 15 * 60 * 1000,
});
```

- stores pending requests in memory
- uses bounded in-memory checkpoint saver
- not restart-safe

## Redis

```ts
import { createRedisFrameworkAdapter } from "kortyx";

const frameworkAdapter = createRedisFrameworkAdapter({
  url: process.env.KORTYX_REDIS_URL!,
  ttlMs: 15 * 60 * 1000,
});
```

- pending requests + checkpoints go to Redis
- supports resume across process restarts

## Env auto-selection

```ts
import { createFrameworkAdapterFromEnv } from "kortyx";

const frameworkAdapter = createFrameworkAdapterFromEnv();
```

Resolution:

- redis if any of these exist:
  - `KORTYX_REDIS_URL`
  - `REDIS_URL`
  - `KORTYX_FRAMEWORK_REDIS_URL`
- otherwise falls back to in-memory

TTL env variables:

- `KORTYX_FRAMEWORK_TTL_MS`
- `KORTYX_TTL_MS`

