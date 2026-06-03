import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function ShimmerBadge(props: ComponentProps<typeof Badge>) {
  return (
    <Badge
      {...props}
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-white/78 via-cyan-50/88 to-fuchsia-50/78 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full",
        props.className
      )}
    />
  );
}
