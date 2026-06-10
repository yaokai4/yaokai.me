"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "magnetic-button inline-flex items-center justify-center gap-2 rounded-full border font-bold transition duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "border-slate-900 bg-slate-950 text-white shadow-[0_12px_30px_rgba(17,24,39,0.18)] hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_16px_38px_rgba(17,24,39,0.22)] active:scale-[0.98]",
        variant === "secondary" &&
          "border-slate-900/10 bg-white/72 text-slate-900 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white active:scale-[0.98]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-slate-700 hover:bg-white/70 active:scale-[0.98]",
        variant === "danger" &&
          "border-red-300/40 bg-red-500/90 text-white shadow-[0_18px_50px_rgba(239,68,68,0.16)] hover:bg-red-500 active:scale-[0.98]",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        size === "icon" && "h-10 w-10 p-0",
        className
      )}
      {...props}
    />
  );
}
