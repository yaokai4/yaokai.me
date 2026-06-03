"use client";

import { motion } from "framer-motion";

export function LiquidBlobBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-[45%] h-[760px] w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-[42%_58%_55%_45%/45%_42%_58%_55%] bg-[linear-gradient(135deg,rgba(125,211,252,0.26),rgba(216,180,254,0.22),rgba(251,207,232,0.2),rgba(187,247,208,0.18))] blur-2xl"
        animate={{
          borderRadius: [
            "42% 58% 55% 45% / 45% 42% 58% 55%",
            "62% 38% 48% 52% / 52% 58% 42% 48%",
            "46% 54% 64% 36% / 38% 58% 42% 62%",
            "42% 58% 55% 45% / 45% 42% 58% 55%"
          ],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.035, 0.985, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[12%] top-[18%] h-[520px] w-[560px] rounded-[58%_42%_46%_54%/48%_58%_42%_52%] bg-[linear-gradient(135deg,rgba(254,240,138,0.18),rgba(125,211,252,0.18),transparent)] blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -22, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
