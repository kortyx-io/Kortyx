import type { ComponentProps } from "react";

export function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
