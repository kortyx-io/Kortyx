import { resolve } from "node:path";
import type { KortyxConfig, WorkflowRegistry } from "@kortyx/runtime";
import { createFileWorkflowRegistry, loadKortyxConfig } from "@kortyx/runtime";
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
  config?: KortyxConfig;
  configPath?: string;
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
    config,
    configPath,
    ...baseArgs
  } = args;

  const resolvedCwd = process.cwd();
  const registryPromise: Promise<WorkflowRegistry | undefined> = (async () => {
    if (workflowRegistry) return workflowRegistry;
    if (workflowsDir) {
      return createFileWorkflowRegistry({
        workflowsDir,
        fallbackId: fallbackWorkflowId ?? "general-chat",
      });
    }

    const loadConfigArgs = {
      cwd: resolvedCwd,
      ...(configPath ? { configPath } : {}),
    } as const;
    const loadedConfig = config ?? (await loadKortyxConfig(loadConfigArgs));
    const resolvedWorkflowsDir =
      loadedConfig?.workflowsDir ?? resolve(resolvedCwd, "src", "workflows");
    const registryOptions = {
      workflowsDir: resolvedWorkflowsDir,
      fallbackId:
        loadedConfig?.fallbackWorkflowId ??
        fallbackWorkflowId ??
        "general-chat",
      ...(loadedConfig?.registry?.cache !== undefined
        ? { cache: loadedConfig.registry.cache }
        : {}),
      ...(loadedConfig?.registry?.extensions
        ? { extensions: loadedConfig.registry.extensions }
        : {}),
    } as const;
    return createFileWorkflowRegistry(registryOptions);
  })();

  return {
    processChat: async (messages: ChatMessage[], options?: Options) => {
      if (selectWorkflow) {
        return processChat({
          ...(baseArgs as ProcessChatArgs<Config, Options>),
          messages,
          options,
          selectWorkflow,
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
        messages,
        options,
        workflowRegistry: registry,
      });
    },
  };
}
