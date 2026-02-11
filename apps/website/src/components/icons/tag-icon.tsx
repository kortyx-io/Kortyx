import type { ComponentProps } from "react";

export function TagIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="m20.59 13.41-7.18 7.18a2 2 0 0 1-2.82 0L3 13V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}
