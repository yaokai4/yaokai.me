"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-slate-900/10 bg-white/76 px-3 text-sm text-slate-950 shadow-sm outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-indigo-300/90 focus:bg-white focus:ring-4 focus:ring-indigo-200/55 disabled:cursor-not-allowed disabled:opacity-60",
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
        "min-h-32 w-full resize-y rounded-md border border-slate-900/10 bg-white/76 px-3 py-3 text-sm text-slate-950 shadow-sm outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-indigo-300/90 focus:bg-white focus:ring-4 focus:ring-indigo-200/55 disabled:cursor-not-allowed disabled:opacity-60",
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
        "h-11 w-full rounded-md border border-slate-900/10 bg-white/76 px-3 text-sm text-slate-950 shadow-sm outline-none backdrop-blur transition focus:border-indigo-300/90 focus:bg-white focus:ring-4 focus:ring-indigo-200/55",
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
      {error ? <span role="alert" className="text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}
