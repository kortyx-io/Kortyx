export function contentToText(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content;

  // Content blocks (LangChain v1): arrays of { type: 'text', text: string } etc.
  if (Array.isArray(content)) {
    return content
      .map((p) => {
        if (p == null) return "";
        if (typeof p === "string") return p;
        if (typeof p === "number" || typeof p === "boolean") return String(p);
        if (typeof p === "object") {
          const obj = p as Record<string, unknown>;
          // Prefer explicit text block format
          if (obj.type === "text" && typeof obj.text === "string") {
            return obj.text as string;
          }
          // Fallback: common shape with direct text
          if (typeof obj.text === "string") return obj.text as string;
          if (typeof obj.content === "string") return obj.content as string;
        }
        return "";
      })
      .join("");
  }

  // Single block object
  if (typeof content === "object") {
    const obj = content as Record<string, unknown>;
    if (obj.type === "text" && typeof obj.text === "string")
      return obj.text as string;
    if (typeof obj.text === "string") return obj.text as string;
    if (typeof obj.content === "string") return obj.content as string;
  }

  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}
