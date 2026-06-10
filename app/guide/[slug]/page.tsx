import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/site/BlogCard";
import { ProjectCard } from "@/components/site/ProjectCard";
import { MarkdownRenderer } from "@/components/site/MarkdownRenderer";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { TableOfContents } from "@/components/site/TableOfContents";
import { Badge } from "@/components/ui/Badge";
import { normalizeArticle, normalizeGuide, normalizeProject } from "@/lib/data";
import { extractToc } from "@/lib/markdown";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import { formatDate, formatStoredReadingTime } from "@/lib/utils";
import { getRequestLocale } from "@/lib/server-locale";
import { withLocalePath } from "@/lib/i18n";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [locale, guide] = await Promise.all([
    getRequestLocale(),
    prisma.guide.findUnique({ where: { slug } })
  ]);
  if (!guide) return {};
  const t = siteCopy[locale].details.guide;

  return createMetadata({
    title: `${guide.title} - ${t.metaSuffix}`,
    description: guide.excerpt,
    path: `/guide/${guide.slug}`,
    image: guide.coverImage,
    locale
  });
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const rawGuide = await prisma.guide.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!rawGuide) notFound();

  const locale = await getRequestLocale();
  const t = siteCopy[locale].details.guide;
  const guide = normalizeGuide(rawGuide);
  const [guides, rawArticles, rawProjects] = await Promise.all([
    prisma.guide.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }] }),
    prisma.article.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }], take: 6 }),
    prisma.project.findMany({ orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }], take: 4 })
  ]);
  const normalizedGuides = guides.map(normalizeGuide);
  const index = normalizedGuides.findIndex((item) => item.id === guide.id);
  const previous = index > 0 ? normalizedGuides[index - 1] : null;
  const next = index >= 0 && index < normalizedGuides.length - 1 ? normalizedGuides[index + 1] : null;
  const relatedArticles = rawArticles.map(normalizeArticle).filter((item) => item.tags.some((tag) => guide.tags.includes(tag)) || item.category.includes(guide.category.split(" ")[0])).slice(0, 2);
  const relatedProjects = rawProjects.map(normalizeProject).slice(0, 2);
  const toc = extractToc(guide.content);

  return (
    <>
      <ReadingProgress />
      <section className="section-container pt-32">
        <Link href={withLocalePath("/guide", locale)} className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-indigo-700 focus-ring">
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
        <div className="mt-8 max-w-4xl">
          <Badge>{guide.category}</Badge>
          <h1 className="mt-6 text-balance text-5xl font-black leading-tight text-slate-950 md:text-7xl">{guide.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{guide.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-md border border-slate-200/80 bg-white px-3 py-1.5 font-semibold">{guide.difficulty}</span>
            <span className="rounded-md border border-slate-200/80 bg-white px-3 py-1.5 font-semibold">{formatStoredReadingTime(guide.readingTime, locale)}</span>
            <span className="rounded-md border border-slate-200/80 bg-white px-3 py-1.5 font-semibold">{formatDate(guide.publishedAt, locale)}</span>
            {guide.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="premium-glass-card rounded-md p-6 md:p-10">
          <MarkdownRenderer content={guide.content} />
        </article>
        <aside className="grid content-start gap-4">
          <div className="premium-glass-card rounded-md p-4">
            <p className="text-sm font-semibold text-slate-950">{t.audience}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{guide.audience}</p>
          </div>
          <TableOfContents items={toc} />
        </aside>
      </section>

      <section className="section-container grid gap-5 pb-16 md:grid-cols-2">
        {previous ? (
          <Link href={withLocalePath(`/guide/${previous.slug}`, locale)} className="premium-glass-card rounded-md p-5">
            <p className="text-sm font-bold text-slate-500">{t.previous}</p>
            <p className="mt-2 font-black text-slate-950">{previous.title}</p>
          </Link>
        ) : null}
        {next ? (
          <Link href={withLocalePath(`/guide/${next.slug}`, locale)} className="premium-glass-card rounded-md p-5 md:text-right">
            <p className="text-sm font-bold text-slate-500">{t.next}</p>
            <p className="mt-2 font-black text-slate-950">{next.title}</p>
          </Link>
        ) : null}
      </section>

      <section className="section-container grid gap-10 pb-24 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-950">{t.relatedProjects}</h2>
            <Link href={withLocalePath("/projects", locale)} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 focus-ring">
              {t.allProjects}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5">
            {relatedProjects.map((item) => (
              <ProjectCard key={item.id} project={item} />
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
            {relatedArticles.length ? relatedArticles.map((item) => <BlogCard key={item.id} article={item} />) : rawArticles.map(normalizeArticle).slice(0, 2).map((item) => <BlogCard key={item.id} article={item} />)}
          </div>
        </div>
      </section>
    </>
  );
}
