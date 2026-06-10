import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SoftHoverCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-md border border-slate-900/10 bg-white/76 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white/90 hover:shadow-[0_24px_72px_rgba(15,23,42,0.10)]", className)}>
      {children}
    </div>
  );
}
