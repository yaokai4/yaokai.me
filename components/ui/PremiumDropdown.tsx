"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

type PremiumDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PremiumDropdown({
  open,
  onOpenChange,
  trigger,
  children,
  className,
  contentClassName
}: PremiumDropdownProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  const clearTimers = React.useCallback(() => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const openWithDelay = React.useCallback(() => {
    clearTimers();
    openTimer.current = window.setTimeout(() => onOpenChange(true), 120);
  }, [clearTimers, onOpenChange]);

  const closeWithDelay = React.useCallback(() => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => onOpenChange(false), 260);
  }, [clearTimers, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  React.useEffect(() => clearTimers, [clearTimers]);

  function focusItem(direction: 1 | -1) {
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a,button,[tabindex='0']") || []);
    if (!items.length) return;
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + direction + items.length) % items.length;
    items[nextIndex]?.focus();
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative z-[100]", className)}
      onMouseEnter={openWithDelay}
      onMouseLeave={closeWithDelay}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onOpenChange(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onOpenChange(true);
          window.requestAnimationFrame(() => focusItem(1));
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onOpenChange(true);
          window.requestAnimationFrame(() => focusItem(-1));
        }
      }}
    >
      {trigger}
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            className={cn("absolute right-0 top-full z-[110] w-80 pt-2", contentClassName)}
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.16 }}
            role="menu"
          >
            <div className="premium-dropdown-surface grid gap-1 rounded-md p-2">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
