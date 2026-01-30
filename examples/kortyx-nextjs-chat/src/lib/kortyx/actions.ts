"use server";

import { readStream, type StreamChunk } from "kortyx";
import { agent } from "@/lib/kortyx-client";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
};

export async function runChat(args: {
  sessionId: string;
  messages: ChatMessage[];
}): Promise<{ sessionId: string; chunks: StreamChunk[] }> {
  const resp = await agent.processChat(args.messages, {
    sessionId: args.sessionId,
  });

  const chunks: StreamChunk[] = [];
  for await (const chunk of readStream(resp.body)) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    chunks.push({
      type: "error",
      message: "No stream chunks received from agent.",
    });
  }

  return { sessionId: args.sessionId, chunks };
}
