import type { GraphState } from "@kortyx/core";
import type { MemoryAdapter, MemoryAdapterOptions } from "../adapter";

type StoredState = {
  state: GraphState;
  savedAt: number;
};

const sharedStores = new Map<string, Map<string, StoredState>>();

function getSharedStore(namespace: string) {
  const existing = sharedStores.get(namespace);
  if (existing) return existing;
  const next = new Map<string, StoredState>();
  sharedStores.set(namespace, next);
  return next;
}

export function createInMemoryAdapter(
  options: MemoryAdapterOptions = {},
): MemoryAdapter {
  const namespace = options.namespace ?? "default";
  const store = getSharedStore(namespace);
  const ttlMs = options.ttlMs;

  const isExpired = (record: StoredState, now: number) => {
    if (!ttlMs) return false;
    return now - record.savedAt > ttlMs;
  };

  const pruneExpired = (now: number) => {
    if (!ttlMs) return;
    for (const [key, record] of store.entries()) {
      if (isExpired(record, now)) store.delete(key);
    }
  };

  return {
    async save(sessionId: string, state: GraphState): Promise<void> {
      const now = Date.now();
      pruneExpired(now);
      store.set(sessionId, { state, savedAt: now });
    },
    async load(sessionId: string): Promise<GraphState | null> {
      const now = Date.now();
      const record = store.get(sessionId);
      if (!record) return null;
      if (isExpired(record, now)) {
        store.delete(sessionId);
        return null;
      }
      return record.state;
    },
    async delete(sessionId: string): Promise<void> {
      store.delete(sessionId);
    },
  };
}
