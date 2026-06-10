import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SoftHoverCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-md border border-[#DAE2EA] bg-white p-5 shadow-[0_1px_2px_rgba(15,45,78,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_6px_20px_rgba(15,45,78,0.08)]", className)}>
      {children}
    </div>
  );
}
