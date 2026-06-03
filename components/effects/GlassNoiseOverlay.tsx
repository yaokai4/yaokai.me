export function GlassNoiseOverlay({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(115deg, rgba(255,255,255,.24), transparent 42%), repeating-linear-gradient(0deg, rgba(15,23,42,.028) 0 1px, transparent 1px 4px)",
        mixBlendMode: "multiply"
      }}
    />
  );
}
