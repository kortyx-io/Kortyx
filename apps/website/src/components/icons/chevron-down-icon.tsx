import type { ComponentProps } from "react";

export function ChevronDownIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
