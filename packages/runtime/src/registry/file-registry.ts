import type { Edge, NodeMap, WorkflowDefinition } from "@kortyx/core";
import { readdir } from "fs/promises";
import { join } from "path";
import type { WorkflowRegistry } from "./interface";

export interface FileWorkflowRegistryOptions {
  workflowsDir: string;
  fallbackId?: string;
  cache?: boolean;
  extensions?: string[];
}

type AnyWorkflow = WorkflowDefinition<NodeMap, readonly Edge<string, string>[]>;

const DEFAULT_EXTENSIONS = [
  ".workflow.ts",
  ".workflow.mts",
  ".workflow.js",
  ".workflow.mjs",
];

function isWorkflowFile(name: string, extensions: string[]) {
  return extensions.some((ext) => name.endsWith(ext));
}

export function createFileWorkflowRegistry(
  options: FileWorkflowRegistryOptions,
): WorkflowRegistry {
  const workflowsDir = options.workflowsDir;
  const fallbackId = options.fallbackId ?? "general-chat";
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
  const shouldCache = options.cache ?? true;

  let workflowCache: Record<string, AnyWorkflow> | null = null;

  async function loadWorkflows(): Promise<Record<string, AnyWorkflow>> {
    if (shouldCache && workflowCache) return workflowCache;

    const files = await readdir(workflowsDir, { withFileTypes: true });
    const workflowFiles = files
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((file) => isWorkflowFile(file, extensions));

    const workflows: Record<string, AnyWorkflow> = {};

    for (const file of workflowFiles) {
      try {
        const modulePath = join(workflowsDir, file);
        const module = await import(modulePath);
        const workflowExport = Object.values(module).find(
          (
            exp,
          ): exp is WorkflowDefinition<
            NodeMap,
            readonly Edge<string, string>[]
          > => {
            const obj = exp as {
              name?: unknown;
              nodes?: unknown;
              edges?: unknown;
            };
            return (
              exp !== null &&
              typeof exp === "object" &&
              typeof obj.name === "string" &&
              typeof obj.nodes === "object" &&
              obj.nodes !== null &&
              Array.isArray(obj.edges)
            );
          },
        );

        if (workflowExport) {
          workflows[workflowExport.name] = workflowExport;
        }
      } catch (error) {
        console.warn(`Failed to load workflow from ${file}:`, error);
      }
    }

    if (shouldCache) workflowCache = workflows;
    return workflows;
  }

  async function list(): Promise<AnyWorkflow[]> {
    const workflows = await loadWorkflows();
    return Object.values(workflows);
  }

  async function get(id: string): Promise<AnyWorkflow | null> {
    const workflows = await loadWorkflows();
    return workflows[id] ?? null;
  }

  async function select(
    id: string,
    selectOptions?: { fallbackId?: string },
  ): Promise<AnyWorkflow> {
    const workflows = await loadWorkflows();
    const fallback = selectOptions?.fallbackId ?? fallbackId;
    const selected = workflows[id] ?? (fallback ? workflows[fallback] : null);

    if (!selected) {
      throw new Error(
        `No workflow found for id "${id}" and no fallback "${fallback}" workflow available`,
      );
    }

    return selected;
  }

  async function refresh() {
    workflowCache = null;
    await loadWorkflows();
  }

  return {
    list,
    get,
    select,
    refresh,
  } satisfies WorkflowRegistry;
}
