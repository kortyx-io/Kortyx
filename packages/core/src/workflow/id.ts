// Workflow identifier type for Kortyx.
// Lifted from apps/chat-api/src/types/workflow-id.ts.

import { z } from "zod";

export const WorkflowIdSchema = z
  .union([
    z.literal("frontdesk"),
    z.literal("job-search"),
    z.literal("general-chat"),
    z.literal("example-workflow"),
  ])
  .describe("Available workflow identifiers - strict validation");

export type WorkflowId = z.infer<typeof WorkflowIdSchema>;
