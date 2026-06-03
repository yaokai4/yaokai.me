import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SoftHoverCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-md border border-white/70 bg-white/66 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-white/86 hover:shadow-[0_24px_72px_rgba(78,89,132,0.14)]", className)}>
      {children}
    </div>
  );
}
