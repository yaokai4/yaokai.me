"use client";

import { cn } from "@/lib/utils";

export function FilterTabs({
  items,
  value,
  onChange,
  ariaLabel = "Filter"
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-slate-900/10 bg-white/60 p-1.5 shadow-sm backdrop-blur" role="group" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-pressed={value === item}
          className={cn(
            "min-h-11 rounded-md border px-3 py-2 text-sm font-bold transition focus-ring",
            value === item
              ? "border-indigo-200 bg-indigo-50 text-indigo-900 shadow-sm"
              : "border-transparent bg-transparent text-slate-500 hover:bg-white/82 hover:text-slate-950"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
