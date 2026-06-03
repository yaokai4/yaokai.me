import { Loader2 } from "lucide-react";

export function AdminEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-semibold text-slate-950">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

export function AdminLoadingState({ label = "加载中" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white p-8 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
