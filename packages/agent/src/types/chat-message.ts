export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number | undefined;
  id?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
};
