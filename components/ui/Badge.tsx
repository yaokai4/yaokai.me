import { cn } from "@/lib/utils";

export function Badge({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-white/70 bg-white/68 px-2.5 py-1 text-xs font-bold text-cyan-800 shadow-sm backdrop-blur",
        className
      )}
    >
      {children}
    </span>
  );
}
