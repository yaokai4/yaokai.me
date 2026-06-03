import { Badge } from "@/components/ui/Badge";
import { SectionGradientHalo } from "@/components/effects/SectionGradientHalo";

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
      <SectionGradientHalo className="opacity-70" />
      <Badge className="mb-5">{eyebrow}</Badge>
      <h1 className="fluid-title text-balance max-w-5xl text-5xl font-black leading-tight md:text-7xl">{title}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
      <div className="aurora-line mt-9 h-px w-full max-w-xl" />
    </section>
  );
}
