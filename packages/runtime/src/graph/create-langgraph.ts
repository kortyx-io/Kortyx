import type {
  BaseNode,
  Edge,
  GraphState,
  NodeConfig,
  NodeContext,
  NodeMap,
  NodeResult,
  WorkflowDefinition,
} from "@kortyx/core";
import { runWithHookContext } from "@kortyx/hooks";
import type { MemoryAdapter } from "@kortyx/memory";
import type { GetProviderFn } from "@kortyx/providers";
import { contentToText, deepMergeWithArrayOverwrite } from "@kortyx/utils";
import {
  type AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { Annotation, interrupt, StateGraph } from "@langchain/langgraph";
import { getCheckpointer } from "../checkpointer";

export interface GraphRuntimeConfig {
  emit?: (event: string, payload: unknown) => void;
  onCheckpoint?: (args: { nodeId: string; state: GraphState }) => void;
  memoryAdapter?: MemoryAdapter;
  /**
   * Provider factory used by ctx.speak to obtain a streaming model.
   * Use @kortyx/providers or implement your own GetProviderFn.
   */
  getProvider?: GetProviderFn;
  [key: string]: unknown;
}

export async function createLangGraph<
  const N extends NodeMap,
  const E extends readonly Edge<
    (keyof N & string) | "__start__",
    (keyof N & string) | "__end__"
  >[],
>(workflow: WorkflowDefinition<N, E>, config: GraphRuntimeConfig) {
  const StateAnnotation = Annotation.Root({
    input: Annotation<string>,
    output: Annotation<string>,
    lastNode: Annotation<string>,
    lastCondition: Annotation<string>,
    lastIntent: Annotation<string>,
    memory: Annotation<Record<string, unknown>>({
      reducer: (l, r) => deepMergeWithArrayOverwrite(l ?? {}, r ?? {}),
      default: () => ({}),
    }),
    config: Annotation<unknown>,
    transitionTo: Annotation<string | null>,
    data: Annotation<Record<string, unknown>>({
      reducer: (l, r) => deepMergeWithArrayOverwrite(l ?? {}, r ?? {}),
      default: () => ({}),
    }),
    conversationHistory: Annotation<
      Array<{ node: string; message: string; timestamp: string }>
    >({
      reducer: (l, r) => [...(l ?? []), ...(r ?? [])],
      default: () => [],
    }),
    awaitingHumanInput: Annotation<boolean>,
  });

  const builder = new StateGraph(StateAnnotation);
  const edgeApi = builder as unknown as {
    addEdge: (from: string, to: string) => void;
    addConditionalEdges: (
      from: string,
      fn: (s: GraphState) => string,
      mapping: Record<string, string>,
    ) => void;
    compile: () => any;
  };
  const workflowName = workflow.name;

  // Ensure an emit function exists so ctx.emit can always call without optional chaining
  type WithEmit = GraphRuntimeConfig & {
    emit: (event: string, payload: unknown) => void;
  };
  const runtimeConfig = config as WithEmit;
  if (!runtimeConfig.emit) {
    runtimeConfig.emit = () => {};
  }

  // Register inline nodes (TS workflows)
  const nodesMap = workflow.nodes as N;

  for (const [nodeId, node] of Object.entries(
    nodesMap as Record<string, BaseNode>,
  )) {
    const nodeConfig: NodeConfig = node.config ?? ({} as NodeConfig);
    const behavior = nodeConfig.behavior ?? {};

    builder.addNode(nodeId, async (state: GraphState) => {
      const ctx = {
        graph: { name: workflowName, node: nodeId },
        config: nodeConfig,
        emit: (event: string, payload: unknown) => {
          runtimeConfig.emit(event, payload);
        },
        error: (message: string) => {
          runtimeConfig.emit("error", {
            node: nodeId,
            message,
          });
        },
        awaitInterrupt: (interruptConfig: any) => {
          const { kind, question } = interruptConfig;
          const isMulti =
            kind === "multi-choice" ||
            (interruptConfig.kind !== "text" &&
              interruptConfig.multiple === true);
          const payload: any = {
            kind,
            multiple: isMulti,
            question,
            ...(interruptConfig.kind !== "text"
              ? { options: interruptConfig.options }
              : {}),
          };
          runtimeConfig.emit("interrupt", {
            node: nodeId,
            workflow: workflowName,
            input: payload,
          });
          const resumed = interrupt(payload) as unknown;
          if (isMulti) {
            if (Array.isArray(resumed)) {
              return (resumed as any[])
                .map((v) =>
                  typeof v === "string"
                    ? v
                    : v && typeof (v as any).id === "string"
                      ? (v as any).id
                      : "",
                )
                .filter(Boolean) as string[];
            }
            if (typeof resumed === "string") return [resumed];
            return [];
          }
          if (typeof resumed === "string") return resumed;
          if (resumed && typeof (resumed as any).id === "string")
            return String((resumed as any).id);
          return "";
        },
        speak: async (
          args: Parameters<NodeContext["speak"]>[0],
        ): Promise<string> => {
          const providerId =
            args.model?.provider ?? nodeConfig.model?.provider ?? "google";
          const modelName =
            args.model?.name ?? nodeConfig.model?.name ?? "gemini-2.5-flash";
          const temperature =
            args.model?.temperature ?? nodeConfig.model?.temperature ?? 0.3;

          const getProvider = runtimeConfig.getProvider;
          if (!getProvider) {
            throw new Error(
              "Runtime config is missing getProvider; wire a provider factory into @kortyx/runtime.",
            );
          }

          const model = getProvider(providerId, modelName, {
            temperature,
            streaming: true,
          });

          const messages = [
            ...(args.system ? [new SystemMessage(args.system)] : []),
            new HumanMessage(args.user ?? ""),
          ];

          const minChars = args.stream?.minChars ?? 24;
          const flushMs = args.stream?.flushMs ?? 100;
          const segmentChars = args.stream?.segmentChars ?? 60;
          let final = "";
          let buffer = "";
          let timer: ReturnType<typeof setTimeout> | null = null;
          const t0 = Date.now();
          let seenFirst = false;

          const isSilent = false;
          const flush = () => {
            if (!buffer) return;
            if (!isSilent)
              ctx.emit("text-delta", { node: nodeId, delta: buffer });
            buffer = "";
            timer = null;
          };

          if (!isSilent) ctx.emit("text-start", { node: nodeId });

          const stream = await model.stream(messages);
          for await (const chunk of stream as AsyncIterable<AIMessageChunk>) {
            const part = contentToText(chunk.content as unknown);
            if (!part) continue;
            if (!seenFirst) {
              seenFirst = true;
              const ttft = Date.now() - t0;
              ctx.emit("status", {
                node: nodeId,
                message: `⏱️ TTFT ${ttft}ms`,
              });
            }
            final += part;

            for (let i = 0; i < part.length; i += segmentChars) {
              const seg = part.slice(i, i + segmentChars);
              buffer += seg;
              if (buffer.length >= minChars) {
                flush();
              } else if (!timer) {
                timer = setTimeout(flush, flushMs);
              }
            }
          }
          if (timer) clearTimeout(timer);
          flush();

          if (!isSilent) ctx.emit("text-end", { node: nodeId });
          const t1 = Date.now();
          if (seenFirst)
            ctx.emit("status", {
              node: nodeId,
              message: `✅ Stream done in ${t1 - t0}ms`,
            });
          return final;
        },
      } satisfies NodeContext;

      if (behavior.checkpoint && config?.onCheckpoint) {
        config.onCheckpoint({ nodeId, state });
      }

      const maxAttempts = behavior.retry?.maxAttempts ?? 1;
      let attempt = 0;
      let nodeResult: NodeResult | undefined;
      let hookMemoryUpdates: Record<string, unknown> | null = null;

      while (attempt < maxAttempts) {
        try {
          attempt++;
          const hookContext = {
            node: ctx,
            state,
            ...(runtimeConfig.getProvider
              ? { getProvider: runtimeConfig.getProvider }
              : {}),
            ...(runtimeConfig.memoryAdapter
              ? { memoryAdapter: runtimeConfig.memoryAdapter }
              : {}),
          };
          const hookRun = await runWithHookContext(hookContext, () =>
            node.run(state, ctx),
          );
          nodeResult = hookRun.result as NodeResult;
          hookMemoryUpdates = hookRun.memoryUpdates;
          break;
        } catch (err) {
          const hasMore = attempt < maxAttempts;
          const delayMs = behavior.retry?.delayMs ?? 0;
          if (hasMore && delayMs > 0) {
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }
          if (!hasMore) throw err;
        }
      }

      const res: NodeResult = (nodeResult ?? {}) as NodeResult;
      if (hookMemoryUpdates) {
        res.infra = {
          ...(res.infra ?? {}),
          memory: deepMergeWithArrayOverwrite(
            ((res.infra?.memory ?? {}) as Record<string, unknown>) || {},
            hookMemoryUpdates,
          ),
        };
      }
      const uiMessage = res.ui?.message;
      const shouldRespond =
        typeof uiMessage === "string" && uiMessage.trim().length > 0;

      if (shouldRespond) {
        ctx.emit("message", { node: nodeId, content: uiMessage });
      }

      if (res.transitionTo) {
        ctx.emit("transition", {
          transitionTo: res.transitionTo,
          payload: res.data ?? {},
        });
      }

      const updates: Record<string, unknown> = {};

      if (typeof res.condition === "string")
        updates.lastCondition = res.condition;
      if (typeof res.intent === "string") updates.lastIntent = res.intent;

      if (res.data && typeof res.data === "object") {
        updates.data = deepMergeWithArrayOverwrite(
          (state.data ?? {}) as Record<string, unknown>,
          res.data as Record<string, unknown>,
        );
      }
      if (res.infra?.memory && typeof res.infra.memory === "object") {
        updates.memory = deepMergeWithArrayOverwrite(
          (state.memory ?? {}) as Record<string, unknown>,
          res.infra.memory as Record<string, unknown>,
        );
      }

      if (res.ui) {
        updates.ui = {
          message:
            typeof res.ui.message === "string"
              ? res.ui.message
              : (state.ui?.message ?? ""),
          structured: deepMergeWithArrayOverwrite(
            (state.ui?.structured ?? {}) as Record<string, unknown>,
            (res.ui.structured ?? {}) as Record<string, unknown>,
          ),
        };
      }

      if (shouldRespond && uiMessage) {
        updates.conversationHistory = [
          ...(state.conversationHistory ?? []),
          {
            node: nodeId,
            message: uiMessage,
            timestamp: new Date().toISOString(),
          },
        ];
      }

      if (res.ui?.structured) {
        const payload = res.ui.structured as Record<string, unknown>;
        const inferredType =
          payload && typeof payload === "object" && "jobs" in payload
            ? "jobs"
            : typeof (payload as { summary?: unknown }).summary === "string" ||
                (payload as { topJobs?: unknown }).topJobs
              ? "summary"
              : "generic";
        ctx.emit("structured_data", {
          node: nodeId,
          dataType: inferredType,
          data: payload,
        });
      }

      return updates as any;
    });
  }

  type EdgeTriple = readonly [string, string, { when?: string }?];
  const condGroups: Record<string, Array<{ when: string; to: string }>> = {};
  const plainEdges: Array<[string, string]> = [];

  for (const edge of workflow.edges as E) {
    const [from, to, condition] = edge as unknown as EdgeTriple;
    if (condition && typeof condition.when === "string" && condition.when) {
      if (!condGroups[from]) condGroups[from] = [];
      condGroups[from].push({ when: condition.when, to });
    } else {
      plainEdges.push([from, to]);
    }
  }

  for (const [from, to] of plainEdges) {
    edgeApi.addEdge(from, to);
  }

  for (const [from, rules] of Object.entries(condGroups)) {
    const mapping: Record<string, string> = Object.fromEntries(
      rules.map((r) => [r.when, r.to]),
    );
    const fallbackKey = `__default__:${from}`;
    mapping[fallbackKey] = "__end__";
    edgeApi.addConditionalEdges(
      from,
      (s: GraphState) => {
        const trigger = s.lastCondition ?? s.lastIntent;
        if (trigger && Object.hasOwn(mapping, trigger as string)) {
          return trigger as string;
        }
        return fallbackKey;
      },
      mapping,
    );
  }

  const sessionId = (config as any)?.session?.id ?? "__default__";
  const checkpointer = getCheckpointer(sessionId);
  const graph = (builder as any).compile({ checkpointer });

  interface GraphExtensions {
    name: string;
    config: GraphRuntimeConfig;
    resume(state: GraphState, input: unknown): Promise<GraphState>;
    timeTravelTo(state: GraphState, checkpointId: string): Promise<GraphState>;
  }
  type RuntimeGraph = typeof graph & GraphExtensions;

  const runtimeGraph = graph as RuntimeGraph;
  runtimeGraph.name = workflow.name;
  runtimeGraph.config = config;

  runtimeGraph.resume = async (state: GraphState, input: unknown) => {
    const resumed = { ...state, input, awaitingHumanInput: false };
    return graph.invoke(resumed as any) as unknown as GraphState;
  };

  runtimeGraph.timeTravelTo = async (
    state: GraphState,
    checkpointId: string,
  ) => {
    const checkpoints = (
      state.memory as { checkpoints?: Record<string, { snapshot: unknown }> }
    )?.checkpoints;
    const snapshot = checkpoints?.[checkpointId];
    if (!snapshot) throw new Error(`Checkpoint '${checkpointId}' not found`);
    return graph.invoke(
      snapshot.snapshot as unknown as Partial<
        (typeof StateAnnotation)["State"]
      >,
    ) as unknown as GraphState;
  };

  return runtimeGraph;
}
