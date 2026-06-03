import { cn } from "@/lib/utils";

export function PremiumStatCard({ label, value, detail, className }: { label: string; value: string; detail?: string; className?: string }) {
  return (
    <div className={cn("premium-glass-card rounded-md p-5", className)}>
      <p className="text-sm font-bold text-cyan-700">{label}</p>
      <p className="mt-4 text-4xl font-black text-slate-950">{value}</p>
      {detail ? <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p> : null}
    </div>
  );
}
