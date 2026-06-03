import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("premium-glass-card rounded-md p-5", className)}>{children}</div>;
}

export function GlowCard({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("premium-glass-card group rounded-md p-5", className)}>
      {children}
    </div>
  );
}
