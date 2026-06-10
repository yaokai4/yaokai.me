"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

export function MagneticButton({
  children,
  href,
  variant = "primary",
  className,
  disabled = false,
  loading = false,
  type = "button",
  onClick
}: MagneticButtonProps) {
  const inactive = disabled || loading;

  const buttonClassName = cn(
    "magnetic-button inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-base font-bold transition focus-ring",
    variant === "primary" && "border-slate-900 bg-slate-950 text-white shadow-[0_12px_30px_rgba(17,24,39,0.18)] hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_16px_38px_rgba(17,24,39,0.22)]",
    variant === "secondary" && "border-slate-900/10 bg-white/76 text-slate-900 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white",
    variant === "ghost" && "border-transparent bg-white/0 text-slate-700 hover:bg-white/72",
    inactive && "pointer-events-none cursor-not-allowed opacity-55 hover:translate-y-0",
    className
  );

  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </>
  );

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="inline-flex w-full sm:w-auto"
    >
      {href && !inactive ? (
        <Link href={href} className={buttonClassName}>
          {content}
        </Link>
      ) : (
        <button type={type} onClick={onClick} disabled={inactive} className={buttonClassName}>
          {content}
        </button>
      )}
    </motion.div>
  );
}
