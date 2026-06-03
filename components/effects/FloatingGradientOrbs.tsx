"use client";

import { motion } from "framer-motion";

const membranes = [
  "left-[-12%] top-[8%] h-[420px] w-[760px] from-cyan-200/46 via-blue-100/34 to-transparent",
  "right-[-10%] top-[18%] h-[460px] w-[720px] from-pink-200/42 via-violet-200/34 to-transparent",
  "bottom-[4%] left-[8%] h-[360px] w-[680px] from-emerald-100/40 via-cyan-100/34 to-transparent",
  "bottom-[10%] right-[12%] h-[330px] w-[620px] from-amber-100/48 via-rose-100/34 to-transparent"
];

export function FloatingGradientOrbs() {
  return (
    <>
      {membranes.map((membrane, index) => (
        <motion.div
          key={membrane}
          aria-hidden
          className={`absolute rounded-[48%_52%_58%_42%/48%_44%_56%_52%] bg-gradient-to-br blur-3xl ${membrane}`}
          animate={{ x: [0, index % 2 ? -30 : 34, 0], y: [0, index % 2 ? 26 : -24, 0], scale: [1, 1.055, 1], rotate: [0, index % 2 ? -3 : 3, 0] }}
          transition={{ duration: 16 + index * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}
