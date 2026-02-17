import type { InterruptInput, InterruptResult } from "@kortyx/core";
import type { ProviderModelRef } from "@kortyx/providers";

export type SchemaLike<T> = {
  safeParse: (value: unknown) =>
    | {
        success: true;
        data: T;
      }
    | {
        success: false;
        error: {
          message?: string;
        };
      };
};

export type StructuredDataMode = "final" | "patch" | "snapshot";

export type UseStructuredDataArgs<TData = unknown> = {
  data: TData;
  dataType?: string | undefined;
  dataSchema?: SchemaLike<TData> | undefined;
  mode?: StructuredDataMode | undefined;
  schemaId?: string | undefined;
  schemaVersion?: string | undefined;
  id?: string | undefined;
  opId?: string | undefined;
};

export type UseReasonStructuredStreamMode = "off" | "patch" | "snapshot";

export type UseReasonStructuredConfig = {
  stream?: UseReasonStructuredStreamMode | undefined;
  optimistic?: boolean | undefined;
  dataType?: string | undefined;
  schemaId?: string | undefined;
  schemaVersion?: string | undefined;
};

export type UseReasonInterruptConfig<
  TRequest extends InterruptInput = InterruptInput,
  TResponse = InterruptResult,
> = {
  requestSchema: SchemaLike<TRequest>;
  responseSchema?: SchemaLike<TResponse> | undefined;
  schemaId?: string | undefined;
  schemaVersion?: string | undefined;
};

export type UseReasonArgs<
  TOutput = unknown,
  TRequest extends InterruptInput = InterruptInput,
  TResponse = InterruptResult,
> = {
  model: ProviderModelRef;
  input: string;
  system?: string | undefined;
  temperature?: number | undefined;
  emit?: boolean | undefined;
  stream?: boolean | undefined;
  id?: string | undefined;
  outputSchema?: SchemaLike<TOutput> | undefined;
  structured?: UseReasonStructuredConfig | undefined;
  interrupt?: UseReasonInterruptConfig<TRequest, TResponse> | undefined;
};

export type UseReasonResult<TOutput = unknown, TResponse = InterruptResult> = {
  id?: string;
  opId: string;
  text: string;
  raw?: unknown;
  output?: TOutput;
  interruptResponse?: TResponse;
};

export type UseInterruptArgs<
  TRequest extends InterruptInput = InterruptInput,
  TResponse = InterruptResult,
> = {
  request: TRequest;
  requestSchema?: SchemaLike<TRequest> | undefined;
  responseSchema?: SchemaLike<TResponse> | undefined;
  schemaId?: string | undefined;
  schemaVersion?: string | undefined;
  id?: string | undefined;
  meta?: Record<string, unknown> | undefined;
};
