import type { GraphState, RuntimeEnvelope } from "@kortyx/core";

/**
 * Prepares the initial graph state from chat context, runtime state, and runtime config.
 * This stays deliberately generic in the config type so apps can shape it.
 */
export interface InitialStateArgs<Config = unknown> {
  input: unknown;
  runtime: RuntimeEnvelope;
  config: Config;
  defaultWorkflowId?: string;
}

export async function buildInitialGraphState<Config>({
  input,
  runtime,
  config,
  defaultWorkflowId,
}: InitialStateArgs<Config>): Promise<GraphState> {
  const currentWorkflow =
    (runtime.requestedWorkflow as any) || (defaultWorkflowId as any);
  if (!currentWorkflow) {
    throw new Error(
      "No workflow selected. Provide defaultWorkflowId (or set runtime.requestedWorkflow) before starting the graph.",
    );
  }

  return {
    input,
    lastNode: "__start__",
    runtime,
    config: config as unknown,
    conversationHistory: [],
    currentWorkflow,
    awaitingHumanInput: false,
  } as GraphState;
}
