"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-white/75 bg-white/72 px-3 text-sm text-slate-950 shadow-sm outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-cyan-300/80 focus:bg-white focus:ring-4 focus:ring-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-md border border-white/75 bg-white/72 px-3 py-3 text-sm text-slate-950 shadow-sm outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-cyan-300/80 focus:bg-white focus:ring-4 focus:ring-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-white/75 bg-white/72 px-3 text-sm text-slate-950 shadow-sm outline-none backdrop-blur transition focus:border-cyan-300/80 focus:bg-white focus:ring-4 focus:ring-cyan-300/18",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      <span className="font-bold">{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}
