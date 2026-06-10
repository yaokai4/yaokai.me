"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/site/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { withLocalePath } from "@/lib/i18n";
import { siteCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  techStack: string[];
  featured: boolean;
};

export function ProjectCard({ project, variant = "default" }: { project: Project; variant?: "default" | "featured" }) {
  const isFeatured = variant === "featured";
  const { locale } = useLocale();
  const t = siteCopy[locale].explorers.projects;

  return (
    <Link href={withLocalePath(`/projects/${project.slug}`, locale)} className={cn("premium-glass-card group grid overflow-hidden rounded-md p-0", isFeatured && "lg:grid-cols-[0.95fr_1.05fr]")}>
      <div className={cn("relative overflow-hidden bg-indigo-50", isFeatured ? "min-h-[260px] lg:min-h-full" : "aspect-[16/9]")}>
        {project.coverImage ? (
          <Image src={project.coverImage} alt={project.title} fill className="object-cover brightness-[1.05] contrast-[0.96] saturate-[1.04] transition duration-500 group-hover:scale-105" sizes={isFeatured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 50vw"} />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.42),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(99,102,241,0.10))]" />
        {project.featured ? <span className="absolute left-4 top-4 rounded-full border border-indigo-200/70 bg-white/82 px-3 py-1.5 text-xs font-black text-indigo-700 shadow-sm backdrop-blur">{t.featured}</span> : null}
      </div>
      <div className={cn("p-5", isFeatured && "flex flex-col justify-center p-6 md:p-8")}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <Badge>{project.category}</Badge>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-600" />
        </div>
        <h3 className={cn("font-black leading-tight text-slate-950", isFeatured ? "text-3xl md:text-4xl" : "text-xl")}>{project.title}</h3>
        <p className={cn("mt-3 text-sm leading-7 text-slate-600", isFeatured && "max-w-2xl text-base")}>{project.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded-full border border-indigo-200/70 bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-700">{tech}</span>
          ))}
        </div>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
          {t.view}
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
