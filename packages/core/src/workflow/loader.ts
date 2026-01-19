// JSON/YAML workflow loader for Kortyx core.
// Minimal synchronous loader used by chat-api and runtime registry.
//
// Note: we intentionally avoid importing `js-yaml` at the type level here
// to keep downstream projects from needing its type declarations. Instead,
// we require it lazily via `require()` typed as `any`.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const require: ((name: string) => unknown) | undefined;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const yamlModule: any =
  typeof require !== "undefined" ? require("js-yaml") : null;
const loadYaml: (input: string) => unknown =
  yamlModule && typeof yamlModule.load === "function"
    ? (yamlModule.load as (input: string) => unknown)
    : (text: string) => text;

/* eslint-enable @typescript-eslint/no-explicit-any */

import { type WorkflowConfig, WorkflowDefinitionSchema } from "./schema";

type WorkflowInput = string | Buffer | unknown;

export function loadWorkflow(input: WorkflowInput): WorkflowConfig {
  let raw: unknown;

  if (Buffer.isBuffer(input)) {
    const text = input.toString("utf8");
    raw = parseText(text);
  } else if (typeof input === "string") {
    raw = parseText(input);
  } else {
    raw = input;
  }

  return WorkflowDefinitionSchema.parse(raw);
}

function parseText(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(text);
  }
  return loadYaml(text);
}
