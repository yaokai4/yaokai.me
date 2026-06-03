"use client";

import { cn } from "@/lib/utils";

export function FilterTabs({
  items,
  value,
  onChange
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-white/70 bg-white/50 p-1.5 shadow-sm backdrop-blur">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-bold transition focus-ring",
            value === item
              ? "border-cyan-200 bg-cyan-100/86 text-cyan-900 shadow-sm"
              : "border-transparent bg-transparent text-slate-500 hover:bg-white/78 hover:text-slate-950"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
