export function SectionGradientHalo({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[420px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_50%_50%,rgba(125,211,252,0.24),rgba(216,180,254,0.16)_38%,rgba(251,207,232,0.1)_52%,transparent_72%)] blur-3xl ${className}`}
    />
  );
}
