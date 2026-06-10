export function GlassNoiseOverlay({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(115deg, rgba(255,255,255,.34), transparent 42%, rgba(224,242,254,.2) 68%, transparent), repeating-linear-gradient(0deg, rgba(255,255,255,.12) 0 1px, rgba(125,211,252,.035) 1px 3px, transparent 3px 7px)",
        mixBlendMode: "screen"
      }}
    />
  );
}
