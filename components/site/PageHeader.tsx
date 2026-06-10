import { Badge } from "@/components/ui/Badge";

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
      <Badge className="mb-5">{eyebrow}</Badge>
      <h1 className="text-balance max-w-5xl text-4xl font-black leading-[1.08] text-slate-950 sm:text-5xl md:text-6xl">{title}</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{description}</p>
      <div className="mt-9 h-px w-full max-w-xl bg-gradient-to-r from-indigo-500/40 via-sky-400/35 to-transparent" />
    </section>
  );
}
