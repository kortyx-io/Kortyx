import type { GraphState, MemoryEnvelope } from "@kortyx/core";
import type { MemoryAdapter } from "@kortyx/memory";
import type { GetProviderFn } from "@kortyx/providers";
import type { WorkflowRegistry } from "@kortyx/runtime";
import { buildInitialGraphState, createLangGraph } from "@kortyx/runtime";
import { createStreamResponse, type StreamChunk } from "@kortyx/stream";
import type { ApplyResumeSelection } from "../interrupt/resume-handler";
import { tryPrepareResumeStream } from "../interrupt/resume-handler";
import type { SaveMemoryFn, SelectWorkflowFn } from "../orchestrator";
import { orchestrateGraphStream } from "../orchestrator";
import type { ChatMessage } from "../types/chat-message";
import { extractLatestUserMessage } from "../utils/extract-latest-message";

type InitializeProvidersFn<Config> = (
  aiConfig: Config extends { ai: infer A } ? A : unknown,
) => void;

export interface ProcessChatArgs<
  Config extends Record<string, unknown>,
  Options,
> {
  messages: ChatMessage[];
  options?: Options | undefined;
  sessionId?: string;
  defaultWorkflowId?: string;
  loadRuntimeConfig: (options?: Options) => Config | Promise<Config>;
  selectWorkflow?: SelectWorkflowFn;
  workflowRegistry?: WorkflowRegistry;
  getProvider: GetProviderFn;
  initializeProviders?: InitializeProvidersFn<Config>;
  memoryAdapter: MemoryAdapter;
  applyResumeSelection?: ApplyResumeSelection;
}

export async function processChat<
  Config extends Record<string, unknown>,
  Options = unknown,
>({
  messages,
  options,
  sessionId,
  defaultWorkflowId,
  loadRuntimeConfig,
  selectWorkflow,
  workflowRegistry,
  getProvider,
  initializeProviders,
  memoryAdapter,
  applyResumeSelection,
}: ProcessChatArgs<Config, Options>): Promise<Response> {
  // Load runtime configuration (API keys, environment, etc.)
  const config = await loadRuntimeConfig(options);
  if (initializeProviders) {
    initializeProviders((config as any)?.ai);
  }
  const runtimeConfig = {
    ...config,
    getProvider,
    ...(memoryAdapter ? { memoryAdapter } : {}),
  } as Record<string, unknown>;

  const workflowSelector: SelectWorkflowFn | null =
    selectWorkflow ??
    (workflowRegistry ? (id) => workflowRegistry.select(id) : null);
  if (!workflowSelector) {
    throw new Error(
      "processChat requires selectWorkflow or workflowRegistry to resolve workflows.",
    );
  }

  // Extract session + input
  const fallbackSessionId = (options as { sessionId?: string } | undefined)
    ?.sessionId;
  const resolvedSessionId =
    sessionId || fallbackSessionId || "anonymous-session";
  const last = messages[messages.length - 1];
  const input = extractLatestUserMessage(messages);

  // Load conversation memory (Redis memory)
  const previousMessages = messages.slice(0, -1);
  const storedState = await memoryAdapter.load(resolvedSessionId);
  const memory: MemoryEnvelope = {
    ...(storedState?.memory ?? {}),
    ...(previousMessages.length > 0 && {
      conversationMessages: previousMessages,
    }),
  };

  // Base state (LLM input, messages, memory)
  const baseState = await buildInitialGraphState({
    input,
    config: runtimeConfig,
    memory,
    ...(defaultWorkflowId ? { defaultWorkflowId } : {}),
  });

  const saveMemory: SaveMemoryFn = async (
    activeSessionId: string,
    state: GraphState,
  ) => {
    await memoryAdapter.save(activeSessionId, state);
  };

  // If this is a resume request, continue from pending snapshot and skip workflow determination
  const resumeStream = await tryPrepareResumeStream({
    lastMessage: last,
    sessionId: resolvedSessionId,
    config: runtimeConfig,
    saveMemory,
    selectWorkflow: workflowSelector,
    ...(defaultWorkflowId ? { defaultWorkflowId } : {}),
    ...(applyResumeSelection ? { applyResumeSelection } : {}),
  });
  if (resumeStream) return createStreamResponse(resumeStream);

  // Determine which workflow to run (defaults to frontdesk)
  const currentWorkflow = baseState.currentWorkflow;
  const selectedWorkflow = await workflowSelector(currentWorkflow as string);

  const graph = await createLangGraph(selectedWorkflow, runtimeConfig as any);

  const orchestratedStream = await orchestrateGraphStream({
    sessionId: resolvedSessionId,
    graph,
    state: { ...baseState, currentWorkflow },
    config: runtimeConfig,
    saveMemory,
    selectWorkflow: workflowSelector,
  });

  return createStreamResponse(orchestratedStream as AsyncIterable<StreamChunk>);
}
