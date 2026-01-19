import type {
  InterruptInput,
  InterruptResult,
  ModelConfig,
} from "@kortyx/core";
import type { MemoryAdapter } from "@kortyx/memory";
import type { KortyxModel } from "@kortyx/providers";
import { getHookContext } from "./context";

type StateSetter<T> = (next: T | ((prev: T) => T)) => void;

type ResolvedModel = {
  provider: string;
  name: string;
  temperature: number | undefined;
};

const DEFAULT_PROVIDER = "google";
const DEFAULT_MODEL = "gemini-2.5-flash";

const resolveModel = (
  modelId: string | undefined,
  config?: ModelConfig,
): ResolvedModel => {
  const defaultProvider = config?.provider ?? DEFAULT_PROVIDER;
  const defaultModel = config?.name ?? DEFAULT_MODEL;

  if (!modelId) {
    return {
      provider: defaultProvider,
      name: defaultModel,
      temperature: config?.temperature,
    };
  }

  const separatorIndex = modelId.indexOf(":");
  if (separatorIndex === -1) {
    return {
      provider: defaultProvider,
      name: modelId,
      temperature: config?.temperature,
    };
  }

  const provider = modelId.slice(0, separatorIndex) || defaultProvider;
  const name = modelId.slice(separatorIndex + 1) || defaultModel;

  return {
    provider,
    name,
    temperature: config?.temperature,
  };
};

export function useAiProvider(modelId?: string): KortyxModel {
  const ctx = getHookContext();
  const getProvider = ctx.getProvider;
  if (!getProvider) {
    throw new Error(
      "useAiProvider requires a provider factory in runtime config.",
    );
  }

  const { provider, name, temperature } = resolveModel(
    modelId,
    ctx.node.config?.model,
  );

  return getProvider(provider, name, {
    ...(temperature !== undefined ? { temperature } : {}),
  });
}

export function useAiMemory(): MemoryAdapter {
  const ctx = getHookContext();
  if (!ctx.memoryAdapter) {
    throw new Error("useAiMemory requires a memory adapter in runtime config.");
  }
  return ctx.memoryAdapter;
}

export function useAiInterrupt(
  input: InterruptInput,
): Promise<InterruptResult> {
  const ctx = getHookContext();
  return Promise.resolve(ctx.node.awaitInterrupt(input));
}

export function useNodeState<T>(initialValue: T): [T, StateSetter<T>];
export function useNodeState<T>(
  key: string,
  initialValue?: T,
): [T, StateSetter<T>];
export function useNodeState<T>(
  keyOrInitial: string | T,
  initialValue?: T,
): [T, StateSetter<T>] {
  const ctx = getHookContext();
  const nodeState = ctx.currentNodeState;

  if (typeof keyOrInitial === "string") {
    const key = keyOrInitial;
    const hasInitial = arguments.length > 1;

    if (!Object.hasOwn(nodeState.byKey, key) && hasInitial) {
      nodeState.byKey[key] = initialValue as T;
      ctx.dirty = true;
    }

    const getValue = () => nodeState.byKey[key] as T;
    const setValue: StateSetter<T> = (next) => {
      const prev = getValue();
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      nodeState.byKey[key] = resolved;
      ctx.dirty = true;
    };

    return [getValue(), setValue];
  }

  const index = ctx.nodeStateIndex++;
  if (index >= nodeState.byIndex.length) {
    nodeState.byIndex[index] = keyOrInitial as T;
    ctx.dirty = true;
  }

  const getValue = () => nodeState.byIndex[index] as T;
  const setValue: StateSetter<T> = (next) => {
    const prev = getValue();
    const resolved =
      typeof next === "function" ? (next as (p: T) => T)(prev) : next;
    nodeState.byIndex[index] = resolved;
    ctx.dirty = true;
  };

  return [getValue(), setValue];
}

export function useWorkflowState<T>(
  key: string,
  initialValue?: T,
): [T, StateSetter<T>] {
  const ctx = getHookContext();
  const workflowState = ctx.workflowState;
  const hasInitial = arguments.length > 1;

  if (!Object.hasOwn(workflowState, key) && hasInitial) {
    workflowState[key] = initialValue as T;
    ctx.dirty = true;
  }

  const getValue = () => workflowState[key] as T;
  const setValue: StateSetter<T> = (next) => {
    const prev = getValue();
    const resolved =
      typeof next === "function" ? (next as (p: T) => T)(prev) : next;
    workflowState[key] = resolved;
    ctx.dirty = true;
  };

  return [getValue(), setValue];
}
