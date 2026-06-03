import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FluidGlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("premium-glass-card rounded-md p-5", className)}>{children}</div>;
}
