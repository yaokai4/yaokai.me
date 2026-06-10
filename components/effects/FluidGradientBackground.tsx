"use client";

export function FluidGradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#f8fafc]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(99,102,241,0.14),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_46%,#f8fafc_100%)]" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/78 via-white/30 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22),transparent_38%,rgba(255,255,255,0.18)_70%,transparent)]" />
    </div>
  );
}
