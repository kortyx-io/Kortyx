import { extractCodeFileLabel } from "./extract-code-file-label";

export type ParsedCodeBlock = {
  startLine: number;
  endLine: number;
  language: string;
  meta?: string;
  code: string;
};

export type CodeTabEntry = {
  language: string;
  meta?: string;
  code: string;
  startLine: number;
};

export type CodeTabMatch = {
  entries: CodeTabEntry[];
  index: number;
};

function isJsTsLanguage(language: string): boolean {
  return ["js", "jsx", "ts", "tsx"].includes(language.toLowerCase());
}

function parseGroupKey(meta: string | undefined): string | null {
  if (!meta) return null;
  const match = /(?:group|tabs)=["']?([a-zA-Z0-9._-]+)["']?/i.exec(meta);
  return match?.[1] ?? null;
}

function parseCodeBlocks(markdown: string): ParsedCodeBlock[] {
  const lines = markdown.split("\n");
  const blocks: ParsedCodeBlock[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    const openMatch = /^```([a-zA-Z0-9_-]+)(.*)$/.exec(line ?? "");
    if (!openMatch) {
      lineIndex += 1;
      continue;
    }

    const language = openMatch[1]?.trim() ?? "";
    const meta = openMatch[2]?.trim() || undefined;
    const startLine = lineIndex + 1;
    lineIndex += 1;

    const codeLines: string[] = [];
    while (
      lineIndex < lines.length &&
      !(lines[lineIndex] ?? "").startsWith("```")
    ) {
      codeLines.push(lines[lineIndex] ?? "");
      lineIndex += 1;
    }

    const endLine = lineIndex + 1;
    if (lineIndex < lines.length) {
      lineIndex += 1;
    }

    blocks.push({
      startLine,
      endLine,
      language,
      meta,
      code: codeLines.join("\n"),
    });
  }

  return blocks;
}

export function parseCodeTabGroups(
  markdown: string,
): Map<number, CodeTabMatch> {
  const blocks = parseCodeBlocks(markdown);
  const matches = new Map<number, CodeTabMatch>();

  const explicitGroups = new Map<string, ParsedCodeBlock[]>();
  for (const block of blocks) {
    if (!isJsTsLanguage(block.language)) continue;
    const key = parseGroupKey(block.meta);
    if (!key) continue;

    const existing = explicitGroups.get(key) ?? [];
    existing.push(block);
    explicitGroups.set(key, existing);
  }

  const groupedBlockStarts = new Set<number>();

  for (const grouped of explicitGroups.values()) {
    if (grouped.length < 2) continue;
    const entries = grouped.map((block) => ({
      language: block.language,
      meta: block.meta,
      code: block.code,
      startLine: block.startLine,
    }));

    entries.forEach((entry, index) => {
      matches.set(entry.startLine, { entries, index });
      groupedBlockStarts.add(entry.startLine);
    });
  }

  for (let index = 0; index < blocks.length - 1; index += 1) {
    const first = blocks[index];
    const second = blocks[index + 1];
    if (!first || !second) continue;

    if (
      groupedBlockStarts.has(first.startLine) ||
      groupedBlockStarts.has(second.startLine)
    ) {
      continue;
    }
    if (!isJsTsLanguage(first.language) || !isJsTsLanguage(second.language))
      continue;

    const firstLabel = extractCodeFileLabel(first.meta);
    const secondLabel = extractCodeFileLabel(second.meta);
    if (!firstLabel || !secondLabel || firstLabel !== secondLabel) continue;

    const entries: CodeTabEntry[] = [
      {
        language: first.language,
        meta: first.meta,
        code: first.code,
        startLine: first.startLine,
      },
      {
        language: second.language,
        meta: second.meta,
        code: second.code,
        startLine: second.startLine,
      },
    ];

    entries.forEach((entry, entryIndex) => {
      matches.set(entry.startLine, { entries, index: entryIndex });
    });
  }

  return matches;
}
