import type { ChatMessage } from "../types/chat-message";

export function extractLatestUserMessage(messages: ChatMessage[]): string {
  if (!messages || messages.length === 0) return "";
  // Find last message with role = "user"
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg?.role === "user" && msg?.content?.trim()) {
      return msg.content.trim();
    }
  }
  return "";
}
