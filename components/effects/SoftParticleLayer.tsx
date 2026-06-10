"use client";

import { motion, useReducedMotion } from "framer-motion";

const particles = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  top: `${(index * 47) % 100}%`,
  size: 4 + (index % 4) * 2,
  tint: [
    "rgba(125,211,252,0.62)",
    "rgba(216,180,254,0.54)",
    "rgba(251,207,232,0.58)",
    "rgba(254,215,170,0.5)",
    "rgba(187,247,208,0.5)"
  ][index % 5]
}));

export function SoftParticleLayer() {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden className="absolute inset-0 hidden overflow-hidden lg:block">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/80 blur-[0.5px]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            boxShadow: `0 0 ${particle.size * 8}px ${particle.tint}, 0 0 ${particle.size * 18}px rgba(255,255,255,0.42)`
          }}
          animate={reducedMotion ? undefined : { y: [0, -22, 0], opacity: [0.16, 0.62, 0.16], scale: [1, 1.22, 1] }}
          transition={{ duration: 7 + (particle.id % 6), repeat: Infinity, ease: "easeInOut", delay: particle.id * 0.09 }}
        />
      ))}
    </div>
  );
}
