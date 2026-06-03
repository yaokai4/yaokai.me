import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { cn } from "@/lib/utils";

export function HolographicCard({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PremiumGlassCard className={cn("holographic-card overflow-hidden", className)}>
      {children}
    </PremiumGlassCard>
  );
}
