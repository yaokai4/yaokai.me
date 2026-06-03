"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import * as React from "react";
import { GlassNoiseOverlay } from "@/components/effects/GlassNoiseOverlay";
import { MouseLightField } from "@/components/effects/MouseLightField";

export function FluidGradientBackground() {
  const [reduced, setReduced] = React.useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 760], [1, 0.58]);
  const y = useTransform(scrollY, [0, 760], [0, 64]);
  const scale = useTransform(scrollY, [0, 760], [1, 1.035]);

  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setReduced(motionQuery.matches || pointerQuery.matches);
    update();
    motionQuery.addEventListener("change", update);
    pointerQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      pointerQuery.removeEventListener("change", update);
    };
  }, []);

  return (
    <motion.div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ opacity, y, scale }}>
      <div className="absolute inset-0 bg-[linear-gradient(118deg,#f9fdff_0%,#f3fbff_28%,#fff8fb_63%,#fbfff8_100%)]" />
      <div className="absolute inset-0 opacity-75 [background-image:linear-gradient(115deg,rgba(14,165,233,0.18),transparent_34%,rgba(168,85,247,0.13)_58%,transparent_78%),linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.18)_42%,rgba(255,255,255,0.72))]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.07)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/72 to-transparent" />
      {reduced ? null : <MouseLightField />}
      <GlassNoiseOverlay className="opacity-[0.075]" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#fffdf8] via-[#fbfdff]/90 to-transparent" />
    </motion.div>
  );
}
