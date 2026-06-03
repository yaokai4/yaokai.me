"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function MagneticButton({ children, href, variant = "primary", className }: MagneticButtonProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 18, mass: 0.45 });
  const y = useSpring(rawY, { stiffness: 220, damping: 18, mass: 0.45 });

  return (
    <motion.div
      style={{ x, y }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        rawX.set((event.clientX - rect.left - rect.width / 2) / 7);
        rawY.set((event.clientY - rect.top - rect.height / 2) / 7);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex"
    >
      <Link
        href={href}
        className={cn(
          "magnetic-button inline-flex h-12 items-center justify-center gap-2 rounded-md border px-5 text-base font-bold transition focus-ring",
          variant === "primary" && "border-white/50 bg-gradient-to-r from-slate-950 via-cyan-950 to-violet-950 text-white shadow-[0_22px_70px_rgba(15,23,42,0.24)] hover:-translate-y-0.5",
          variant === "secondary" && "border-white/75 bg-white/72 text-slate-800 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white",
          variant === "ghost" && "border-transparent bg-transparent text-slate-700 hover:bg-white/70",
          className
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}
