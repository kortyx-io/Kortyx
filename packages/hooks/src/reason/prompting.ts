import type { InterruptInput } from "@kortyx/core";
import { toJSONSchema } from "zod";
import type { SchemaLike } from "../types";

const tryStringify = (value: unknown): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const tryGetSchemaHint = (schema: unknown): string | undefined => {
  try {
    const hint = toJSONSchema(schema as never);
    return JSON.stringify(hint, null, 2);
  } catch {
    return undefined;
  }
};

const withSchemaHint = (
  input: string,
  label: string,
  schema: unknown,
): string => {
  const hint = tryGetSchemaHint(schema);
  if (!hint) return input;
  return `${input}\n\n${label}:\n${hint}`;
};

export const defaultInterruptFirstPassInput = (args: {
  input: string;
  requestSchema: SchemaLike<unknown>;
  outputSchema?: SchemaLike<unknown>;
}): string => {
  const base = args.outputSchema
    ? [
        args.input,
        "Output rules:",
        "- Return JSON only. No markdown fences.",
        "- Return an object with keys: output, interruptRequest, draftText.",
        "- output must match the expected output JSON schema.",
        "- interruptRequest must match the expected interrupt request JSON schema.",
        "- interruptRequest must be a non-null object.",
        "- draftText should be a concise plain-language summary of output.",
        "- If uncertain, still return a valid interruptRequest with safe default options.",
      ].join("\n\n")
    : [
        args.input,
        "Output rules:",
        "- Return JSON only. No markdown fences.",
        "- Return an object with keys: draftText, interruptRequest.",
        "- draftText should be the current draft answer text.",
        "- interruptRequest must match the expected interrupt request JSON schema.",
        "- interruptRequest must be a non-null object.",
        "- If uncertain, still return a valid interruptRequest with safe default options.",
      ].join("\n\n");

  const withInterruptSchema = withSchemaHint(
    base,
    "Expected interrupt request JSON schema (for `interruptRequest`)",
    args.requestSchema,
  );

  if (!args.outputSchema) return withInterruptSchema;
  const withOutputSchema = withSchemaHint(
    withInterruptSchema,
    "Expected output JSON schema (for `output`)",
    args.outputSchema,
  );
  return [
    withOutputSchema,
    "JSON template:",
    '{ "output": { ... }, "interruptRequest": { ... }, "draftText": "..." }',
  ].join("\n\n");
};

export const defaultContinuationInput = (args: {
  input: string;
  draftText: string;
  draftOutput?: unknown;
  request: InterruptInput;
  response: unknown;
}): string =>
  [
    "You are continuing a paused reasoning task after user input.",
    "Update the previous result using the user response and return the final answer only.",
    "If the previous output was JSON, return JSON in the same schema.",
    "",
    `Original request:\n${args.input}`,
    `Draft answer text:\n${args.draftText}`,
    `Draft output object:\n${tryStringify(args.draftOutput ?? args.draftText)}`,
    `Interrupt request shown to user:\n${tryStringify(args.request)}`,
    `User response:\n${tryStringify(args.response)}`,
  ].join("\n\n");

export const withOutputGuardrails = (
  input: string,
  schema?: SchemaLike<unknown>,
): string => {
  const base = [
    input,
    "Output rules:",
    "- Return only JSON, no markdown fences.",
    "- Ensure the response conforms to the expected output schema.",
    "- Do not include explanatory text outside the JSON object.",
  ].join("\n\n");
  return withSchemaHint(base, "Expected output JSON schema", schema);
};
