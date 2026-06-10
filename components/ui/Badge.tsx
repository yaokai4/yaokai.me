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
        "inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold leading-none tracking-wide text-indigo-800",
        className
      )}
    >
      {children}
    </span>
  );
}
