import type { InterruptInput } from "@kortyx/core";
import type { SchemaLike } from "../types";
import { parseWithSchema } from "../validation";

const tryJsonParse = (
  value: string,
): { ok: true; value: unknown } | { ok: false } => {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false };
  }
};

const extractJsonCodeBlock = (value: string): string | null => {
  const match = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (!match || typeof match[1] !== "string") return null;
  const inner = match[1].trim();
  return inner.length > 0 ? inner : null;
};

const tryStringify = (value: unknown): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const resolveOutputCandidate = (text: string): unknown => {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const direct = tryJsonParse(trimmed);
  if (direct.ok) return direct.value;

  const block = extractJsonCodeBlock(trimmed);
  if (block) {
    const parsedBlock = tryJsonParse(block);
    if (parsedBlock.ok) return parsedBlock.value;
  }

  return text;
};

export const parseInterruptFirstPassResult = <
  TRequest extends InterruptInput = InterruptInput,
  TOutput = unknown,
>(args: {
  text: string;
  requestSchema: SchemaLike<TRequest>;
  outputSchema?: SchemaLike<TOutput>;
}): {
  draftText: string;
  request: TRequest;
  output?: TOutput;
} => {
  const candidate = resolveOutputCandidate(args.text);
  if (!isRecord(candidate)) {
    throw new Error(
      "useReason first pass with interrupt must return a JSON object.",
    );
  }

  const requestCandidates: unknown[] = [
    candidate.interruptRequest,
    candidate.request,
    candidate.interrupt,
    candidate,
  ];
  const requestPayload = requestCandidates.find(
    (value) => value !== null && value !== undefined,
  );

  const request = parseWithSchema(
    args.requestSchema,
    requestPayload,
    "useReason interrupt.request",
  );

  let output: TOutput | undefined;
  if (args.outputSchema) {
    const outputPayload = Object.hasOwn(candidate, "output")
      ? candidate.output
      : candidate;
    output = parseWithSchema(
      args.outputSchema,
      outputPayload,
      "useReason output",
    );
  }

  const explicitDraft =
    typeof candidate.draftText === "string" && candidate.draftText.length > 0
      ? candidate.draftText
      : typeof candidate.text === "string" && candidate.text.length > 0
        ? candidate.text
        : undefined;

  if (!args.outputSchema && !explicitDraft) {
    throw new Error(
      "useReason first pass with interrupt requires `draftText` when outputSchema is not provided.",
    );
  }

  const draftText =
    explicitDraft ??
    (output !== undefined ? tryStringify(output) : String(args.text ?? ""));

  return {
    draftText,
    request,
    ...(output !== undefined ? { output } : {}),
  };
};
