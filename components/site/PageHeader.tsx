export function PageHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="section-container relative pt-32 md:pt-36">
      <p className="editorial-label mb-4">{eyebrow}</p>
      <h1 className="text-balance max-w-5xl text-4xl font-black leading-[1.12] tracking-tight text-indigo-950 sm:text-5xl md:text-6xl">{title}</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{description}</p>
      <div className="editorial-bar mt-9 w-full" />
    </section>
  );
}
