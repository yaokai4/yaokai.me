import { AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("premium-glass-card grid justify-items-center rounded-md p-8 text-center", className)}>
      <div className="liquid-panel grid h-14 w-14 place-items-center rounded-md border border-indigo-200/70 bg-white text-indigo-700 shadow-sm">
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-black text-slate-950">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid w-full max-w-md gap-4 rounded-md border border-[#DAE2EA] bg-white p-6 shadow-[0_1px_2px_rgba(15,45,78,0.04)]" role="status" aria-live="polite" aria-label={label}>
      <div className="h-3 rounded-md bg-[linear-gradient(90deg,rgba(226,232,240,.7),rgba(255,255,255,.95),rgba(226,232,240,.7))] bg-[length:220%_100%] [animation:skeletonShimmer_1.4s_ease-in-out_infinite]" />
      <div className="h-3 w-3/4 rounded-md bg-[linear-gradient(90deg,rgba(226,232,240,.7),rgba(255,255,255,.95),rgba(226,232,240,.7))] bg-[length:220%_100%] [animation:skeletonShimmer_1.4s_ease-in-out_infinite]" />
      <div className="h-3 w-1/2 rounded-md bg-[linear-gradient(90deg,rgba(226,232,240,.7),rgba(255,255,255,.95),rgba(226,232,240,.7))] bg-[length:220%_100%] [animation:skeletonShimmer_1.4s_ease-in-out_infinite]" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-[linear-gradient(90deg,rgba(226,232,240,.72),rgba(255,255,255,.96),rgba(226,232,240,.72))] bg-[length:220%_100%] [animation:skeletonShimmer_1.4s_ease-in-out_infinite]", className)} />;
}
