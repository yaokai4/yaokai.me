import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function ShimmerBadge(props: ComponentProps<typeof Badge>) {
  return <Badge {...props} className={cn(props.className)} />;
}
