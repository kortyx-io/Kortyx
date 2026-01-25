"use client";

import { useEffect, useRef } from "react";

export type ChatInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  });

  return (
    <div className="p-3 border-slate-200 dark:border-slate-800 flex items-end gap-2">
      <textarea
        ref={textareaRef}
        rows={1}
        className="flex-1 resize-none rounded-lg px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 max-h-40 overflow-y-auto"
        placeholder="Send a message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled) onSubmit();
          }
        }}
        disabled={disabled}
      />
      <button
        type="button"
        disabled={disabled || !value.trim()}
        className="rounded-md bg-emerald-600 text-white px-4 py-2 disabled:opacity-50"
        onClick={() => !disabled && onSubmit()}
      >
        {disabled ? "Streaming..." : "Send"}
      </button>
    </div>
  );
}
