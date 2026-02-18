"use client";

import { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { CheckIcon } from "@/components/icons/check-icon";
import { CopyIcon } from "@/components/icons/copy-icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DocsCodeBlockEntry = {
  language: string;
  code: string;
  tabLabel?: string;
  fileLabel?: string;
};

type DocsCodeBlockProps = {
  entries: DocsCodeBlockEntry[];
};

const accessibleOneDark = {
  ...oneDark,
  comment: {
    ...oneDark.comment,
    color: "hsl(220, 14%, 72%)",
  },
  prolog: {
    ...oneDark.prolog,
    color: "hsl(220, 14%, 72%)",
  },
  doctype: {
    ...oneDark.doctype,
    color: "hsl(220, 14%, 72%)",
  },
  cdata: {
    ...oneDark.cdata,
    color: "hsl(220, 14%, 72%)",
  },
};

function defaultTabLabel(language: string): string {
  const lower = language.toLowerCase();
  if (lower === "ts" || lower === "tsx") return "TS";
  if (lower === "js" || lower === "jsx") return "JS";
  return lower.toUpperCase();
}

export function DocsCodeBlock(props: DocsCodeBlockProps) {
  const { entries } = props;
  const isSingleEntry = entries.length === 1;
  const tabValues = useMemo(
    () => entries.map((_, index) => `tab-${index}`),
    [entries],
  );
  const [activeTab, setActiveTab] = useState(tabValues[0] ?? "tab-0");
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const activeIndex = tabValues.indexOf(activeTab);
  const activeEntry = entries[activeIndex] ?? entries[0];
  if (!activeEntry) return null;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeEntry.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-4 rounded-md border border-border bg-muted dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 dark:border-zinc-800">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8 border bg-accent dark:border-zinc-600 dark:bg-zinc-800/60">
            {entries.map((entry, index) => (
              <TabsTrigger
                key={`${entry.language}-${tabValues[index]}`}
                value={tabValues[index] ?? `tab-${index}`}
                className={`h-7 px-3 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white ${
                  isSingleEntry ? "cursor-default" : "cursor-pointer"
                }`}
              >
                {entry.tabLabel ?? defaultTabLabel(entry.language)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex min-w-0 items-center gap-2">
          {activeEntry.fileLabel ? (
            <span className="truncate font-mono text-sm text-muted-foreground dark:text-zinc-200">
              {activeEntry.fileLabel}
            </span>
          ) : null}
          <button
            type="button"
            aria-label="Copy code"
            title={copied ? "Copied" : "Copy code"}
            onClick={onCopy}
            className="inline-flex cursor-pointer items-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-green-500" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="docs-sidebar-scroll overflow-x-auto">
        <SyntaxHighlighter
          style={isDark ? accessibleOneDark : oneLight}
          language={activeEntry.language}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: 0,
            padding: "24px",
            background: "transparent",
            border: "none",
            fontSize: "0.85rem",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-geist-mono)",
              fontStyle: "normal",
            },
          }}
        >
          {activeEntry.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
