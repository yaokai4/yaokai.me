import { cn } from "@/lib/utils";

export function StatusBadge({
  label,
  tone = "default"
}: {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-medium",
        tone === "default" && "bg-slate-100 text-slate-700",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-yellow-50 text-yellow-700",
        tone === "danger" && "bg-red-50 text-red-700"
      )}
    >
      {label}
    </span>
  );
}
