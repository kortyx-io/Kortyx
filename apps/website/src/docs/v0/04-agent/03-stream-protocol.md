---
id: v0-agent-stream-protocol
title: "Stream Chunk Protocol"
description: "Consume typed stream chunks for text deltas, messages, interrupts, transitions, and completion."
keywords: [kortyx, streamchunk, sse, interrupt, transition]
sidebar_label: "Stream Protocol"
---
# Stream Chunk Protocol

The stream protocol is defined in `@kortyx/stream` as `StreamChunk`.

## Core chunk types

- `session`
- `status`
- `text-start`
- `text-delta`
- `text-end`
- `message`
- `structured-data`
- `interrupt`
- `transition`
- `done`
- `error`

## Typical client loop

```ts
import { readStream, type StreamChunk } from "kortyx";

const chunks: StreamChunk[] = [];
for await (const chunk of readStream(response.body)) {
  chunks.push(chunk);

  if (chunk.type === "text-delta") {
    // append to in-flight assistant text
  }

  if (chunk.type === "interrupt") {
    // render selection UI and resume with token/requestId
  }

  if (chunk.type === "done") {
    break;
  }
}
```

## Notes

- `done` is terminal for a stream run
- `error` may be followed by `done`
- `session` helps clients persist conversation identity

