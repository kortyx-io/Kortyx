import type { GraphState } from "@kortyx/core";

export interface MemoryAdapterOptions {
  namespace?: string;
  ttlMs?: number;
}

export interface MemoryAdapter {
  save(sessionId: string, state: GraphState): Promise<void>;
  load(sessionId: string): Promise<GraphState | null>;
  delete(sessionId: string): Promise<void>;
}
