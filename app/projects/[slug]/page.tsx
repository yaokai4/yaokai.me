import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BlogCard } from "@/components/site/BlogCard";
import { GlassCard, GlowCard } from "@/components/site/GlassCard";
import { GuideCard } from "@/components/site/GuideExplorer";
import { MarkdownRenderer } from "@/components/site/MarkdownRenderer";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { prisma } from "@/lib/prisma";
import { breadcrumbJsonLd, createMetadata, creativeWorkJsonLd } from "@/lib/seo";
import { getPublicArticles, normalizeGuide, normalizeProject } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { withLocalePath } from "@/lib/i18n";
import { localizeProject, localizeProjects } from "@/lib/project-localization";
import { siteCopy } from "@/lib/public-copy";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [locale, project, copyOverrides] = await Promise.all([
    getRequestLocale(),
    prisma.project.findUnique({ where: { slug } }),
    getCopyOverrides()
  ]);
  if (!project) return {};
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).details.project;
  const localizedProject = localizeProject(normalizeProject(project), locale);

  return createMetadata({
    title: `${localizedProject.title} - ${t.metaSuffix}`,
    description: localizedProject.excerpt,
    path: `/projects/${localizedProject.slug}`,
    image: localizedProject.coverImage,
    locale
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const rawProject = await prisma.project.findUnique({ where: { slug } });
  if (!rawProject) notFound();

  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).details.project;
  const project = localizeProject(normalizeProject(rawProject), locale);
  const [rawAll, articles, guides] = await Promise.all([
    prisma.project.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }).then((items) => items.map(normalizeProject)),
    getPublicArticles().then((items) => items.slice(0, 6)),
    prisma.guide.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }], take: 6 }).then((items) => items.map(normalizeGuide))
  ]);
  const all = localizeProjects(rawAll, locale);
  const index = all.findIndex((item) => item.id === project.id);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const related = all.filter((item) => item.id !== project.id).slice(0, 2);
  const techStack: string[] = Array.isArray(project.techStack) ? (project.techStack as string[]) : [];
  const relatedArticles = articles
    .filter((item) => item.tags.some((tag) => techStack.includes(tag)) || item.category.includes(project.category.split(" ")[0]))
    .slice(0, 2);
  const relatedGuides = guides
    .filter((item) => item.tags.some((tag) => techStack.includes(tag)) || project.category.includes(item.category.split(" ")[0]))
    .slice(0, 2);
  const responsibilities = Array.isArray(project.responsibilities) && project.responsibilities.length ? project.responsibilities : [project.role];
  const keyChallenges = Array.isArray(project.keyChallenges) && project.keyChallenges.length ? project.keyChallenges : [project.challenge];
  const solutions = Array.isArray(project.solutions) && project.solutions.length ? project.solutions : [project.solution];
  const technicalHighlights = Array.isArray(project.technicalHighlights) && project.technicalHighlights.length ? project.technicalHighlights : techStack.slice(0, 5);
  const measurableResults = Array.isArray(project.measurableResults) && project.measurableResults.length ? project.measurableResults : [project.result];
  const nextSteps = Array.isArray(project.nextSteps) && project.nextSteps.length ? project.nextSteps : [t.fallbackNextStep];
  const period = [project.startDate, project.endDate].filter(Boolean).join(" - ");
  const caseSections: Array<{ title: string; description?: string; items?: string[] }> = [
    { title: t.sections.overview, description: project.longDescription || project.excerpt },
    { title: t.sections.role, items: responsibilities },
    { title: t.sections.problem, items: keyChallenges },
    { title: t.sections.solution, items: solutions },
    { title: t.sections.architecture, description: project.architectureNotes || t.fallbackArchitecture, items: techStack },
    { title: t.sections.technicalHighlights, items: technicalHighlights },
    { title: t.sections.result, items: measurableResults },
    { title: t.sections.retrospective, items: nextSteps }
  ];

  return (
    <>
      <ReadingProgress />
      <section className="section-container pt-32">
        <Link href={withLocalePath("/projects", locale)} className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-indigo-700 focus-ring">
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Badge className="mb-5">{project.category}</Badge>
            <h1 className="text-balance text-5xl font-black leading-tight text-slate-950 md:text-7xl">{project.title}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">{project.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge>{project.status}</Badge>
              {period ? <Badge>{period}</Badge> : null}
              <Badge>{project.role}</Badge>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.demoUrl ? (
                <Link href={project.demoUrl} target="_blank">
                  <Button>
                    <ExternalLink className="h-4 w-4" />
                    {t.liveDemo}
                  </Button>
                </Link>
              ) : null}
              {project.githubUrl ? (
                <Link href={project.githubUrl} target="_blank">
                  <Button variant="secondary">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </Link>
              ) : null}
              {!project.demoUrl && !project.githubUrl ? (
                <span className="rounded-md border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-bold text-slate-600">
                  {t.privateProject}
                </span>
              ) : null}
            </div>
          </div>
          <GlassCard>
            <p className="text-sm font-semibold text-slate-950">{t.techStack}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="section-container grid gap-5 py-16 md:grid-cols-2 lg:grid-cols-4">
        {[
          [t.sections.role, project.role],
          [t.sections.problem, project.challenge],
          [t.sections.solution, project.solution],
          [t.sections.result, project.result]
        ].map(([title, value]) => (
          <GlowCard key={title}>
            <p className="text-sm font-medium text-indigo-700">{title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{value}</p>
          </GlowCard>
        ))}
      </section>

      {project.screenshots.length ? (
        <section className="section-container pb-16">
          <div className="mb-6">
            <Badge>Screenshots</Badge>
            <h2 className="mt-4 text-3xl font-black text-slate-950">{t.screenshots}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {project.screenshots.map((src, screenshotIndex) => (
              <figure key={src} className="premium-glass-card overflow-hidden rounded-md p-0">
                <div className="relative aspect-[16/10] bg-slate-100">
                  <Image src={src} alt={`${project.title} screenshot ${screenshotIndex + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-container grid gap-5 pb-16 md:grid-cols-2">
        {caseSections.map((section) => (
          <article key={section.title} className="premium-glass-card rounded-md p-5 md:p-6">
            <h2 className="text-2xl font-black text-slate-950">{section.title}</h2>
            {section.description ? <p className="mt-4 text-sm leading-7 text-slate-600">{section.description}</p> : null}
            {section.items?.length ? (
              <ul className="mt-4 grid gap-2">
                {section.items.map((item) => (
                  <li key={item} className="rounded-md border border-[#DAE2EA] bg-white px-3 py-2 text-sm leading-6 text-slate-600">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <section className="section-container grid gap-10 pb-16 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="premium-glass-card rounded-md p-6 md:p-8">
          <MarkdownRenderer content={project.content} />
        </article>
        <aside className="grid content-start gap-4">
          {previous ? (
            <Link href={withLocalePath(`/projects/${previous.slug}`, locale)} className="premium-glass-card rounded-md p-4 text-sm text-slate-600">
              <span className="font-bold text-slate-500">{t.previous}</span>
              <p className="mt-2 font-black text-slate-950">{previous.title}</p>
            </Link>
          ) : null}
          {next ? (
            <Link href={withLocalePath(`/projects/${next.slug}`, locale)} className="premium-glass-card rounded-md p-4 text-sm text-slate-600">
              <span className="font-bold text-slate-500">{t.next}</span>
              <p className="mt-2 font-black text-slate-950">{next.title}</p>
            </Link>
          ) : null}
        </aside>
      </section>

      <section className="section-container pb-24">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-950">{t.nextReading}</h2>
            <Link href={withLocalePath("/projects", locale)} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 focus-ring">
              {t.allProjects}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {related.map((item) => (
              <ProjectCard key={item.id} project={item} />
            ))}
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-slate-950">{t.relatedGuides}</h2>
                <Link href={withLocalePath("/guide", locale)} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 focus-ring">
                  {t.allGuides}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-5">
                {(relatedGuides.length ? relatedGuides : guides.slice(0, 2)).map((item) => (
                  <GuideCard key={item.id} guide={item} />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-slate-950">{t.relatedArticles}</h2>
                <Link href={withLocalePath("/blog", locale)} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 focus-ring">
                  {t.allArticles}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-5">
                {(relatedArticles.length ? relatedArticles : articles.slice(0, 2)).map((item) => (
                  <BlogCard key={item.id} article={item} />
                ))}
              </div>
            </div>
          </div>
        </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            creativeWorkJsonLd(project),
            breadcrumbJsonLd([
              { name: t.breadcrumbHome, path: "/" },
              { name: t.breadcrumbProjects, path: "/projects" },
              { name: project.title, path: `/projects/${project.slug}` }
            ])
          ])
        }}
      />
    </>
  );
}
