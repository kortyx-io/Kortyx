// JSON/YAML workflow loader for Kortyx core.
// Minimal synchronous loader used by chat-api and runtime registry.
//
import { load as loadYaml } from "js-yaml";
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
