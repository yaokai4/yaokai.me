"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function PremiumGlassCard({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    ref.current?.style.setProperty("--card-x", `${event.clientX - rect.left}px`);
    ref.current?.style.setProperty("--card-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={cn("premium-glass-card group rounded-md p-5", className)}>
      {children}
    </div>
  );
}
