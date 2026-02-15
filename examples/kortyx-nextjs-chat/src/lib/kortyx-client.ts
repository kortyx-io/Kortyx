import {
  createAgent,
  createInMemoryAdapter,
  createInMemoryWorkflowRegistry,
  getProvider,
  initializeProviders,
} from "kortyx";
import { generalChatWorkflow } from "@/workflows/general-chat.workflow";
import { interruptDemoWorkflow } from "@/workflows/interrupt-demo.workflow";
import { threeStepsWorkflow } from "@/workflows/three-steps.workflow";

type RuntimeOptions = {
  sessionId: string;
  workflowId?: string;
};

const workflowRegistry = createInMemoryWorkflowRegistry(
  [generalChatWorkflow, threeStepsWorkflow, interruptDemoWorkflow],
  {
    fallbackId: "general-chat",
  },
);

export function loadRuntimeConfig(options?: RuntimeOptions) {
  const sessionId = options?.sessionId ?? "anonymous-session";

  return {
    session: { id: sessionId },
    ai: {
      googleApiKey:
        process.env.GOOGLE_API_KEY ??
        process.env.GEMINI_API_KEY ??
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
        process.env.KORTYX_GOOGLE_API_KEY ??
        process.env.KORTYX_GEMINI_API_KEY,
    },
  };
}

const memoryAdapter = createInMemoryAdapter({
  namespace: "kortyx-nextjs-chat",
  ttlMs: 1000 * 60 * 60, // 1 hour
});

export const agent = createAgent({
  workflowRegistry,
  loadRuntimeConfig,
  getProvider,
  initializeProviders,
  memoryAdapter,
  fallbackWorkflowId: "general-chat",
});
