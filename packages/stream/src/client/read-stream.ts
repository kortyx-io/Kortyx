// packages/stream/src/client/read-stream.ts
import type { StreamChunk } from "../types/stream-chunk";

/**
 * Reads a server-sent event (SSE) Response body and yields StreamChunk objects.
 */
export async function* readStream(
  body: ReadableStream<Uint8Array> | null,
): AsyncGenerator<StreamChunk, void, void> {
  if (!body) return;

  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      const payload = part.slice(6);
      if (payload.trim() === "[DONE]") return;
      try {
        yield JSON.parse(payload) as StreamChunk;
      } catch (err: any) {
        console.warn("Invalid JSON in stream chunk:", payload);
        console.error(err);
      }
    }
  }
}
