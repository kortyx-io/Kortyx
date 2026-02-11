"use client";

import { useState } from "react";
import { ChainLinkIcon } from "@/components/icons/chain-link-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { cn } from "@/lib/utils/cn";

type DocsHeadingAnchorButtonProps = {
  headingId: string;
  className?: string;
};

export function DocsHeadingAnchorButton(props: DocsHeadingAnchorButtonProps) {
  const { headingId, className } = props;
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = new URL(window.location.href);
    url.hash = headingId;
    window.history.replaceState(null, "", url.toString());

    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Copy heading link"
      className={cn(
        "inline-flex cursor-pointer items-center rounded-md p-1 text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100",
        className,
      )}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-green-600" />
      ) : (
        <ChainLinkIcon className="h-4 w-4" />
      )}
    </button>
  );
}
