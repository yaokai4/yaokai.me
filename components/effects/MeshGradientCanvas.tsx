"use client";

import { motion } from "framer-motion";

export function MeshGradientCanvas() {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_8%,rgba(125,211,252,0.38),transparent_42%),radial-gradient(ellipse_at_86%_0%,rgba(216,180,254,0.34),transparent_44%),radial-gradient(ellipse_at_84%_72%,rgba(251,207,232,0.30),transparent_46%),radial-gradient(ellipse_at_20%_86%,rgba(187,247,208,0.26),transparent_44%),linear-gradient(180deg,#fffdf8_0%,#f8fcff_48%,#fff6fb_100%)]"
      animate={{ backgroundPosition: ["0% 0%", "7% 4%", "0% 0%"], filter: ["saturate(1)", "saturate(1.08)", "saturate(1)"] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
