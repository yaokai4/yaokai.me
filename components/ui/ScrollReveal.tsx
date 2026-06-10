export function ScrollReveal({
  children,
  className,
  delay: _delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  void _delay;
  return <div className={className}>{children}</div>;
}
