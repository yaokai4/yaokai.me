import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-9 max-w-3xl", className)}>
      {eyebrow ? <p className="editorial-label mb-3">{eyebrow}</p> : null}
      <h2 className="text-balance text-2xl font-black leading-tight tracking-tight text-indigo-950 md:text-4xl">
        {title}
      </h2>
      <div className="editorial-bar mt-4 w-full" />
      {description ? <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">{description}</p> : null}
    </div>
  );
}
