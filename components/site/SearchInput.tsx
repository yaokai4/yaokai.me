"use client";

import { Search, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "搜索",
  clearLabel = "清空搜索"
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearLabel?: string;
}) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-md border border-[#DAE2EA] bg-white pl-11 pr-11 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300/90 focus:bg-white focus:ring-4 focus:ring-indigo-200/55"
      />
      {value ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-indigo-50 hover:text-slate-800 focus-ring"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </label>
  );
}
