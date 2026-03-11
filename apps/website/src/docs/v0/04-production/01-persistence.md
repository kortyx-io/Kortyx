---
id: v0-runtime-persistence-boundary
title: "Persistence Boundary"
description: "Understand what Kortyx persists for runtime control and what your app should persist itself."
keywords: [kortyx, persistence, framework-adapter, resume]
sidebar_label: "Persistence Boundary"
---
# Persistence Boundary

There are two separate concerns here, but only one is Kortyx-owned.

## 1. Framework persistence (runtime internals)

Used for:

- interrupt/resume tokens
- checkpoint state for paused runs

Configured through framework adapters (`createFrameworkAdapterFromEnv`, `createInMemoryFrameworkAdapter`, `createRedisFrameworkAdapter`).

## 2. App persistence (your product data)

Used for:

- conversation records
- customer/profile state
- app-specific business context

## Important current behavior

- Kortyx owns framework persistence only
- business/application persistence should live in your app DB or service layer
- framework state is keyed by run/session context and TTL-driven

> **Good to know:** If you need long-lived product data in a node, call your own persistence layer directly. Do not treat runtime checkpoint state as an app data store.
