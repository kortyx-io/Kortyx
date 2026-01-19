import type { GraphState } from "@kortyx/core";
import type { MemoryAdapter, MemoryAdapterOptions } from "../adapter";

export interface PostgresAdapterOptions extends MemoryAdapterOptions {
  connectionString: string;
}

export function createPostgresAdapter(
  options: PostgresAdapterOptions,
): MemoryAdapter {
  const describe = () => `PostgresAdapter(${options.connectionString})`;

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
