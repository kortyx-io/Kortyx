---
id: v0-node-resolution
title: "Node Resolution"
description: "Understand how Kortyx resolves run handlers from function refs, module paths, and registry keys."
keywords: [kortyx, node-resolution, registerNode, dynamic-import]
sidebar_label: "Node Resolution"
---
# Node Resolution

`run` in each node can be resolved in three ways.

## 1. Direct function (TypeScript workflows)

```ts
nodes: {
  chat: { run: chatNode, params: {} }
}
```

This is the cleanest option when your workflows are TypeScript modules.

## 2. Module path string (YAML/JSON or TS)

```yaml
nodes:
  chat:
    run: ../nodes/chat.node.ts#chatNode
```

Resolution behavior (from `resolveNodeHandler`):

- Path-like strings are dynamically imported
- If `#exportName` is present, that named export must be a function
- If absent, runtime tries:
  1. `default` export as function
  2. exactly one named function export

## 3. Registry key string

If the `run` value is not path-like, runtime treats it as a registry id.

```ts
import { registerNode } from "kortyx";

registerNode("chatNode", chatNode);

// workflow node:
// { run: "chatNode" }
```

Helper APIs:

- `registerNode`
- `getRegisteredNode`
- `listRegisteredNodes`
- `clearRegisteredNodes`

