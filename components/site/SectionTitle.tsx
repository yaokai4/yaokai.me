export function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? <p className="editorial-label mb-3">{eyebrow}</p> : null}
      <h2 className="text-balance text-2xl font-black tracking-tight text-indigo-950 md:text-4xl">{title}</h2>
      <div className="editorial-bar mt-4 w-full" />
      {description ? <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">{description}</p> : null}
    </div>
  );
}
