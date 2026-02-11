export function extractLeadingFileComment(codeValue: string): {
  fileLabel: string | null;
  code: string;
} {
  const lines = codeValue.split("\n");
  const firstLine = lines[0]?.trim() ?? "";

  const match = /^(?:\/\/|#)\s*(.+)$/.exec(firstLine);
  if (!match?.[1]) {
    return { fileLabel: null, code: codeValue };
  }

  const possiblePath = match[1].trim();
  const looksLikePath =
    possiblePath.includes("/") ||
    possiblePath.includes("\\") ||
    /\.[a-z0-9]+$/i.test(possiblePath);

  if (!looksLikePath) {
    return { fileLabel: null, code: codeValue };
  }

  return {
    fileLabel: possiblePath,
    code: lines.slice(1).join("\n").replace(/^\n+/, ""),
  };
}
