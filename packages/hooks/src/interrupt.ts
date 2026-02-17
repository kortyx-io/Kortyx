import type { InterruptInput, InterruptResult } from "@kortyx/core";
import { getHookContext } from "./context";
import type { UseInterruptArgs } from "./types";
import { parseWithSchema } from "./validation";

export const awaitInterruptInternal = <
  TRequest extends InterruptInput = InterruptInput,
  TResponse = InterruptResult,
>(
  args: UseInterruptArgs<TRequest, TResponse>,
): Promise<TResponse> => {
  const ctx = getHookContext();

  const request = parseWithSchema(
    args.requestSchema,
    args.request,
    "useInterrupt request",
  );

  const enrichedRequest = {
    ...request,
    ...(typeof args.schemaId === "string" && args.schemaId.length > 0
      ? { schemaId: args.schemaId }
      : {}),
    ...(typeof args.schemaVersion === "string" && args.schemaVersion.length > 0
      ? { schemaVersion: args.schemaVersion }
      : {}),
    ...(typeof args.id === "string" && args.id.length > 0
      ? { id: args.id }
      : {}),
    ...(args.meta && typeof args.meta === "object" && !Array.isArray(args.meta)
      ? { meta: args.meta }
      : {}),
  } as InterruptInput;

  const raw = ctx.node.awaitInterrupt(enrichedRequest);
  const response = parseWithSchema(
    args.responseSchema,
    raw,
    "useInterrupt response",
  );

  return Promise.resolve(response);
};
