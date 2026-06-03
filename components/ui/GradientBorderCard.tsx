import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GradientBorderCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("gradient-border-card rounded-md p-5", className)}>
      {children}
    </div>
  );
}
