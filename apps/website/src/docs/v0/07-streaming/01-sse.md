---
id: v0-streaming-sse
title: "SSE Server and Client"
description: "Create SSE responses from stream chunks and parse streamed responses in clients."
keywords: [kortyx, sse, streamchunk, createStreamResponse, readStream]
sidebar_label: "SSE Server and Client"
---
# SSE Server and Client

Streaming helpers are in `@kortyx/stream` and re-exported by `kortyx`.

## Server: `createStreamResponse`

```ts
import { createStreamResponse, type StreamChunk } from "kortyx";

async function* run(): AsyncGenerator<StreamChunk> {
  yield { type: "status", message: "starting" };
  yield { type: "message", content: "hello" };
  yield { type: "done" };
}

export async function GET() {
  return createStreamResponse(run());
}
```

`createStreamResponse` serializes each chunk as:

```text
data: {json}\n\n
```

and finishes with:

```text
data: [DONE]\n\n
```

## Client: `readStream`

```ts
import { readStream } from "kortyx";

const response = await fetch("/api/chat");

for await (const chunk of readStream(response.body)) {
  if (chunk.type === "text-delta") {
    // update UI incrementally
  }
}
```

## Default stream headers

`createStreamResponse` sets:

- `content-type: text/event-stream`
- `cache-control: no-cache`
- `connection: keep-alive`
- `x-accel-buffering: no`

