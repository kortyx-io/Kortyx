import GithubSlugger from "github-slugger";
import { cleanHeadingText } from "./clean-heading-text";

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractToc(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const slugger = new GithubSlugger();
  const lines = content.split("\n");
  let inCodeFence = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (!match) continue;

    const level = match[1]?.length === 3 ? 3 : 2;
    const text = cleanHeadingText(match[2] ?? "");
    if (!text) continue;

    headings.push({
      id: slugger.slug(text),
      text,
      level,
    });
  }

  return headings;
}
