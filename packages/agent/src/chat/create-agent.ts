import { resolve } from "node:path";
import type { FrameworkAdapter, WorkflowRegistry } from "@kortyx/runtime";
import {
  createFileWorkflowRegistry,
  createFrameworkAdapterFromEnv,
} from "@kortyx/runtime";
import type { SelectWorkflowFn } from "../orchestrator";
import type { ChatMessage } from "../types/chat-message";
import type { ProcessChatArgs } from "./process-chat";
import { processChat } from "./process-chat";

export interface CreateAgentArgs<
  Config extends Record<string, unknown>,
  Options,
> extends Omit<
    ProcessChatArgs<Config, Options>,
    "messages" | "options" | "selectWorkflow" | "workflowRegistry"
  > {
  workflowsDir?: string;
  workflowRegistry?: WorkflowRegistry;
  selectWorkflow?: SelectWorkflowFn;
  fallbackWorkflowId?: string;
}

export function createAgent<
  Config extends Record<string, unknown>,
  Options = unknown,
>(args: CreateAgentArgs<Config, Options>) {
  const {
    workflowsDir,
    workflowRegistry,
    selectWorkflow,
    fallbackWorkflowId,
    defaultWorkflowId,
    frameworkAdapter,
    ...baseArgs
  } = args;

  const resolvedDefaultWorkflowId = defaultWorkflowId ?? fallbackWorkflowId;
  const resolvedFrameworkAdapter: FrameworkAdapter =
    frameworkAdapter ?? createFrameworkAdapterFromEnv();

  const resolvedCwd = process.cwd();
  const registryPromise: Promise<WorkflowRegistry | undefined> = (async () => {
    if (workflowRegistry) return workflowRegistry;
    if (workflowsDir) {
      return createFileWorkflowRegistry({
        workflowsDir,
        fallbackId: fallbackWorkflowId ?? "general-chat",
      });
    }

    const resolvedWorkflowsDir = resolve(resolvedCwd, "src", "workflows");
    const registryOptions = {
      workflowsDir: resolvedWorkflowsDir,
      fallbackId: fallbackWorkflowId ?? "general-chat",
    } as const;
    return createFileWorkflowRegistry(registryOptions);
  })();

  return {
    processChat: async (messages: ChatMessage[], options?: Options) => {
      if (selectWorkflow) {
        return processChat({
          ...(baseArgs as ProcessChatArgs<Config, Options>),
          ...(resolvedDefaultWorkflowId
            ? { defaultWorkflowId: resolvedDefaultWorkflowId }
            : {}),
          messages,
          options,
          selectWorkflow,
          frameworkAdapter: resolvedFrameworkAdapter,
        });
      }

      const registry = await registryPromise;
      if (!registry) {
        throw new Error(
          "createAgent requires workflowsDir, workflowRegistry, or selectWorkflow.",
        );
      }

      return processChat({
        ...(baseArgs as ProcessChatArgs<Config, Options>),
        ...(resolvedDefaultWorkflowId
          ? { defaultWorkflowId: resolvedDefaultWorkflowId }
          : {}),
        messages,
        options,
        workflowRegistry: registry,
        frameworkAdapter: resolvedFrameworkAdapter,
      });
    },
  };
}
