"use client";

import { CommandPalette } from "@/components/site/CommandPalette";

export function CommandSearch({ showButton = true }: { showButton?: boolean }) {
  return <CommandPalette showButton={showButton} />;
}
