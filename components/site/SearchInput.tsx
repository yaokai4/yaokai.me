"use client";

import { Search, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "搜索"
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-700" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-md border border-white/75 bg-white/72 pl-11 pr-11 text-sm font-semibold text-slate-950 shadow-sm outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-cyan-300/80 focus:bg-white focus:ring-4 focus:ring-cyan-300/18"
      />
      {value ? (
        <button
          type="button"
          aria-label="清空搜索"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </label>
  );
}
