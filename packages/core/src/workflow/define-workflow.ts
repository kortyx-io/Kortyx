// Minimal workflow DSL entrypoint.
// Lifted from apps/chat-api/src/lib/langgraph/framework/core/defineWorkflow.ts

import type { Edge, NodeMap, ValidatedWorkflowDefinition } from "./types";

export function defineWorkflow<
  const N extends NodeMap,
  const E extends readonly Edge<
    (keyof N & string) | "__start__",
    (keyof N & string) | "__end__"
  >[],
>(workflow: ValidatedWorkflowDefinition<N, E>) {
  return workflow as ValidatedWorkflowDefinition<N, E>;
}
