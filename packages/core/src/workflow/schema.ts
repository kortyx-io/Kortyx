// Workflow schema definitions for Kortyx.
// Derived from apps/chat-api/src/types/workflow.ts.

import { z } from "zod";
import { NodeConfigSchema } from "../node";

export const WorkflowNodeDefSchema = z
  .object({
    id: z.string(),
    type: z.enum(["ai", "tool", "logic", "custom"]),
    config: NodeConfigSchema,
  })
  .strict();

export type WorkflowNodeDef = z.infer<typeof WorkflowNodeDefSchema>;

export const EdgeConditionSchema = z
  .object({
    when: z.string().optional(),
    description: z.string().optional(),
    probability: z.number().min(0).max(1).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export type WorkflowEdgeCondition = z.infer<typeof EdgeConditionSchema>;

export const WorkflowEdgeSchema = z.union([
  z.tuple([z.string(), z.string()]),
  z.tuple([z.string(), z.string(), EdgeConditionSchema]),
]);

export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>;

export const WorkflowDefinitionSchema = z
  .object({
    name: z.string(),
    version: z.string().optional(),
    description: z.string().optional(),
    nodes: z.array(WorkflowNodeDefSchema),
    edges: z.array(WorkflowEdgeSchema),
    transitions: z.array(z.record(z.string(), z.string())).optional(),
  })
  .strict();

export type WorkflowConfig = z.infer<typeof WorkflowDefinitionSchema>;
