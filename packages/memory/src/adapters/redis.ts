import type { GraphState } from "@kortyx/core";
import type { MemoryAdapter, MemoryAdapterOptions } from "../adapter";

export interface RedisAdapterOptions extends MemoryAdapterOptions {
  url: string;
}

export function createRedisAdapter(
  options: RedisAdapterOptions,
): MemoryAdapter {
  const describe = () => `RedisAdapter(${options.url})`;

  return {
    async save(_sessionId: string, _state: GraphState): Promise<void> {
      throw new Error(`${describe()} is not implemented yet.`);
    },
    async load(_sessionId: string): Promise<GraphState | null> {
      throw new Error(`${describe()} is not implemented yet.`);
    },
    async delete(_sessionId: string): Promise<void> {
      throw new Error(`${describe()} is not implemented yet.`);
    },
  };
}
