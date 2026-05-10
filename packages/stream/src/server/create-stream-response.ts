// packages/stream/src/server/create-stream-response.ts
import type { StreamChunk } from "../types/stream-chunk";
import { JsonToSseTransformStream } from "./json-to-sse";

export const STREAM_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache",
  connection: "keep-alive",
  "x-accel-buffering": "no",
};

/**
 * Turns an AsyncIterable<StreamChunk> into a streamed HTTP Response.
 * Works in Node, Bun, Cloudflare, Edge, etc.
 */
export function createStreamResponse(
  stream: AsyncIterable<StreamChunk>,
): Response {
  const readable = new ReadableStream<StreamChunk>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(chunk);
        }
      } catch (err) {
        controller.enqueue({
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        } as StreamChunk);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(
    readable
      .pipeThrough(new JsonToSseTransformStream())
      .pipeThrough(new TextEncoderStream()),
    { headers: STREAM_HEADERS },
  );
}
