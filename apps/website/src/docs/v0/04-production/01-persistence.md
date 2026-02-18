---
id: v0-runtime-persistence-boundary
title: "Persistence Boundary"
description: "Understand the split between framework persistence and business memory in Kortyx."
keywords: [kortyx, persistence, framework-adapter, memory-adapter, resume]
sidebar_label: "Persistence Boundary"
---
# Persistence Boundary

Kortyx currently has two separate persistence concerns.

## 1. Framework persistence (runtime internals)

Used for:

- interrupt/resume tokens
- checkpoint state for paused runs

Configured through framework adapters (`createFrameworkAdapterFromEnv`, `createInMemoryFrameworkAdapter`, `createRedisFrameworkAdapter`).

## 2. Business memory (your app data)

Used only when nodes call `useAiMemory()` and your agent is configured with `memoryAdapter`.

Typical use:

- conversation memory
- profile state
- app-specific context

## Important current behavior

- agent does **not** auto-save business memory every run
- business memory and framework persistence are intentionally separate
- framework state is keyed by run/session context and TTL-driven

