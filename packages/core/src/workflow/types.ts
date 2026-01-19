// Core workflow type system for Kortyx.
// Lifted from apps/chat-api/src/lib/langgraph/framework/core/types.ts
// with dependencies moved into @kortyx/core.

import type { NodeConfig, NodeHandler } from "../node";
import type { WorkflowEdgeCondition } from "./schema";

export type NodeType = "tool" | "ai" | "logic" | "custom";

export interface BaseNode {
  type: NodeType;
  run: NodeHandler;
  config: NodeConfig;
}

export type NodeMap = Record<string, BaseNode>;

// Use the runtime EdgeCondition shape for compile-time typing as well.
export type EdgeCondition = WorkflowEdgeCondition;

export type Edge<From extends string, To extends string> =
  | readonly [From, To]
  | readonly [From, To, EdgeCondition];

export interface WorkflowDefinition<
  N extends NodeMap,
  E extends readonly Edge<
    (keyof N & string) | "__start__",
    (keyof N & string) | "__end__"
  >[],
> {
  name: string;
  version: string;
  description?: string;
  nodes: N;
  edges: E;
  transitions?: Record<string, string>;
}

// ---------- Type-level validation: topological order from __start__ with no edges into __start__ or out of __end__ ----------
type FromOf<E> = E extends readonly [infer F extends string, any, ...any[]]
  ? F
  : never;
type ToOf<E> = E extends readonly [any, infer T extends string, ...any[]]
  ? T
  : never;

// Validate that edges are listed in a topological order with respect to a growing set of seen nodes (starting with __start__).
// Each edge must have its `from` already seen, and we add `to` to the seen set.
// Disallow edges into __start__ and out of __end__.
type ValidateTopo<
  Arr extends readonly unknown[],
  Seen extends string,
> = Arr extends readonly []
  ? "__end__" extends Seen
    ? true
    : false
  : Arr extends readonly [infer E1, ...infer Rest]
    ? FromOf<E1> extends Seen
      ? FromOf<E1> extends "__end__"
        ? false
        : ToOf<E1> extends "__start__"
          ? false
          : ValidateTopo<Rest, Seen | ToOf<E1>>
      : false
    : false;

export type ValidatedWorkflowDefinition<
  N extends NodeMap,
  E extends readonly Edge<
    (keyof N & string) | "__start__",
    (keyof N & string) | "__end__"
  >[],
> = ValidateTopo<E, "__start__"> extends true
  ? WorkflowDefinition<N, E>
  : never;
