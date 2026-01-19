import type { GraphState, MemoryEnvelope } from "@kortyx/core";

/**
 * Prepares the initial runtime graph state from chat context, memory, and runtime config.
 * This stays deliberately generic in the config type so apps can shape it.
 */
export interface InitialStateArgs<Config = unknown> {
  input: string;
  memory: MemoryEnvelope;
  config: Config;
  defaultWorkflowId?: string;
}

export async function buildInitialGraphState<Config>({
  input,
  memory,
  config,
  defaultWorkflowId = "frontdesk",
}: InitialStateArgs<Config>): Promise<GraphState> {
  return {
    input,
    lastNode: "__start__",
    memory,
    config: config as unknown,
    conversationHistory: [],
    currentWorkflow:
      (memory.currentWorkflow as any) || (defaultWorkflowId as any),
    awaitingHumanInput: false,
  } as GraphState;
}
