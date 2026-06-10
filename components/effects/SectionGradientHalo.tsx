export function SectionGradientHalo({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[420px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_50%_50%,rgba(251,191,36,0.22),rgba(251,113,133,0.14)_38%,rgba(45,212,191,0.1)_56%,transparent_72%)] blur-3xl ${className}`}
    />
  );
}
