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
        "inline-flex items-center rounded-full border border-indigo-200/70 bg-indigo-50/80 px-2.5 py-1 text-xs font-bold leading-none text-indigo-700 shadow-sm backdrop-blur",
        className
      )}
    >
      {children}
    </span>
  );
}
