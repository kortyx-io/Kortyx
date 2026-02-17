import { getHookContext } from "./context";
import type {
  StructuredDataMode,
  UseReasonStructuredConfig,
  UseStructuredDataArgs,
} from "./types";
import { parseWithSchema } from "./validation";

export const emitStructuredData = <TData = unknown>(
  args: UseStructuredDataArgs<TData>,
): void => {
  const ctx = getHookContext();
  const validated = parseWithSchema(
    args.dataSchema,
    args.data,
    "useStructuredData data",
  );

  ctx.node.emit("structured_data", {
    node: ctx.node.graph.node,
    ...(typeof args.dataType === "string" && args.dataType.length > 0
      ? { dataType: args.dataType }
      : {}),
    ...(typeof args.mode === "string" ? { mode: args.mode } : {}),
    ...(typeof args.schemaId === "string" && args.schemaId.length > 0
      ? { schemaId: args.schemaId }
      : {}),
    ...(typeof args.schemaVersion === "string" && args.schemaVersion.length > 0
      ? { schemaVersion: args.schemaVersion }
      : {}),
    ...(typeof args.id === "string" && args.id.length > 0
      ? { id: args.id }
      : {}),
    ...(typeof args.opId === "string" && args.opId.length > 0
      ? { opId: args.opId }
      : {}),
    data: validated,
  });
};

export const shouldEmitStructured = (
  cfg: UseReasonStructuredConfig | undefined,
): boolean => (cfg?.stream ?? "patch") !== "off";

export const resolveStructuredMode = (
  cfg: UseReasonStructuredConfig | undefined,
): StructuredDataMode => {
  const mode = cfg?.stream ?? "patch";
  if (mode === "snapshot") return "snapshot";
  if (mode === "patch") return "patch";
  return "final";
};
