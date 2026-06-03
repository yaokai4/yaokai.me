"use client";

import * as React from "react";

export function MouseLightField() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = window.innerWidth * 0.52;
    let y = window.innerHeight * 0.28;

    const update = () => {
      frame = 0;
      element.style.setProperty("--mx", `${x}px`);
      element.style.setProperty("--my", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden opacity-90 md:block"
      style={{
        background:
          "radial-gradient(620px circle at var(--mx,52%) var(--my,28%), rgba(125,211,252,.22), transparent 36%), radial-gradient(420px circle at var(--mx,52%) var(--my,28%), rgba(244,114,182,.15), transparent 48%), radial-gradient(320px circle at var(--mx,52%) var(--my,28%), rgba(52,211,153,.12), transparent 54%)"
      }}
    />
  );
}
