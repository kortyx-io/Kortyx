"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons/check-icon";
import { ChevronsUpDownIcon } from "@/components/icons/chevrons-up-down-icon";
import { TagIcon } from "@/components/icons/tag-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

type VersionOption = {
  version: string;
  href: string;
  isLatest: boolean;
};

type DocsVersionSelectorProps = {
  options: VersionOption[];
  selectedVersion: string;
};

export function DocsVersionSelector(props: DocsVersionSelectorProps) {
  const { options, selectedVersion } = props;
  const selected = options.find((option) => option.version === selectedVersion);
  const title = selected?.isLatest
    ? "Latest Version"
    : `Version ${selectedVersion}`;
  const subtitle = selected?.version ?? selectedVersion;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full cursor-pointer justify-between rounded-md px-2! py-2 focus-visible:ring-0"
        >
          <span className="flex items-center gap-2">
            <span className="rounded-md border border-blue-500/40 bg-blue-500/10 p-2 text-blue-600">
              <TagIcon className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block text-md font-semibold text-zinc-900">
                {title}
              </span>
              <span className="block text-sm text-zinc-500">{subtitle}</span>
            </span>
          </span>
          <ChevronsUpDownIcon className="h-4 w-4 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-0 p-0"
      >
        {options.map((option) => {
          const active = option.version === selectedVersion;
          return (
            <DropdownMenuItem key={option.version} asChild>
              <Link
                href={option.href}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-2 py-2",
                  active ? "bg-zinc-100" : "",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md border p-2",
                      active
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-600"
                        : "border-zinc-300 bg-zinc-100 text-zinc-500",
                    )}
                  >
                    <TagIcon className="h-4 w-4" />
                  </span>
                  <span className="text-left">
                    <span className="block text-base font-medium text-zinc-900">
                      {option.isLatest ? "Latest" : `Version ${option.version}`}
                    </span>
                    <span className="block text-sm text-zinc-500">
                      {option.version}
                    </span>
                  </span>
                </span>
                {active ? (
                  <CheckIcon className="h-5 w-5 text-green-600" />
                ) : null}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
