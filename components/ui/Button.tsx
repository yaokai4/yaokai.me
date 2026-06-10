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
          "border-indigo-900 bg-indigo-900 text-white shadow-[0_2px_10px_rgba(15,45,78,0.2)] hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-[0_6px_18px_rgba(15,45,78,0.24)] active:scale-[0.98]",
        variant === "secondary" &&
          "border-indigo-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-indigo-400 active:scale-[0.98]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-slate-700 hover:bg-indigo-50/60 active:scale-[0.98]",
        variant === "danger" &&
          "border-red-300/40 bg-red-500/90 text-white shadow-[0_1px_2px_rgba(15,45,78,0.04)] hover:bg-red-500 active:scale-[0.98]",
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
