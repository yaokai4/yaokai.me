"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  top: `${(index * 47) % 100}%`,
  size: 2 + (index % 3)
}));

export function SoftParticleLayer() {
  return (
    <div aria-hidden className="absolute inset-0 hidden overflow-hidden md:block">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/82 shadow-[0_0_18px_rgba(125,211,252,0.52)]"
          style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
          animate={{ y: [0, -18, 0], opacity: [0.18, 0.72, 0.18], scale: [1, 1.25, 1] }}
          transition={{ duration: 5.5 + (particle.id % 5), repeat: Infinity, ease: "easeInOut", delay: particle.id * 0.08 }}
        />
      ))}
    </div>
  );
}
