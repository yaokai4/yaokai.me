import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/site/BlogCard";
import { GuideCard } from "@/components/site/GuideExplorer";
import { MarkdownRenderer } from "@/components/site/MarkdownRenderer";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { TableOfContents } from "@/components/site/TableOfContents";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { blogPostingJsonLd, breadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { extractToc, getReadingTime } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { normalizeArticle, normalizeGuide } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { withLocalePath } from "@/lib/i18n";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [locale, article] = await Promise.all([
    getRequestLocale(),
    prisma.article.findUnique({ where: { slug } })
  ]);
  if (!article) return {};

  return createMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    path: `/blog/${article.slug}`,
    image: article.coverImage,
    locale
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const rawArticle = await prisma.article.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!rawArticle) notFound();

  const locale = await getRequestLocale();
  const t = siteCopy[locale].details.blog;
  const article = normalizeArticle(rawArticle);
  const [articles, guides] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
    }).then((items) => items.map(normalizeArticle)),
    prisma.guide.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6
    }).then((items) => items.map(normalizeGuide))
  ]);
  const index = articles.findIndex((item) => item.id === article.id);
  const previous = index > 0 ? articles[index - 1] : null;
  const next = index >= 0 && index < articles.length - 1 ? articles[index + 1] : null;
  const related = articles.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 2);
  const relatedGuides = guides
    .filter((item) => item.tags.some((tag) => article.tags.includes(tag)) || article.category.includes(item.category.split(" ")[0]))
    .slice(0, 2);
  const toc = extractToc(article.content);

  return (
    <>
      <ReadingProgress />
      <section className="section-container pt-32">
        <Link href={withLocalePath("/blog", locale)} className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-indigo-700 focus-ring">
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
        <div className="mt-8 max-w-4xl">
          <Badge>{article.category}</Badge>
          <h1 className="mt-6 text-balance text-5xl font-black leading-tight text-slate-950 md:text-7xl">{article.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-md border border-slate-200/80 bg-white px-3 py-1.5 font-semibold">{formatDate(article.publishedAt, locale)}</span>
            <span className="rounded-md border border-slate-200/80 bg-white px-3 py-1.5 font-semibold">{getReadingTime(article.content, locale)}</span>
            {article.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="premium-glass-card rounded-md p-6 md:p-10">
          <MarkdownRenderer content={article.content} />
        </article>
        <div>
          <TableOfContents items={toc} />
        </div>
      </section>

      <section className="section-container grid gap-5 pb-16 md:grid-cols-2">
        {previous ? (
          <Link href={withLocalePath(`/blog/${previous.slug}`, locale)} className="premium-glass-card rounded-md p-5">
            <p className="text-sm font-bold text-slate-500">{t.previous}</p>
            <p className="mt-2 font-black text-slate-950">{previous.title}</p>
          </Link>
        ) : null}
        {next ? (
          <Link href={withLocalePath(`/blog/${next.slug}`, locale)} className="premium-glass-card rounded-md p-5 md:text-right">
            <p className="text-sm font-bold text-slate-500">{t.next}</p>
            <p className="mt-2 font-black text-slate-950">{next.title}</p>
          </Link>
        ) : null}
      </section>

      <section className="section-container grid gap-10 pb-24 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-950">{t.nextReading}</h2>
            <Link href={withLocalePath("/blog", locale)} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 focus-ring">
              {t.allArticles}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5">
            {(related.length ? related : articles.filter((item) => item.id !== article.id).slice(0, 2)).map((item) => (
              <BlogCard key={item.id} article={item} />
            ))}
          </div>
        </div>
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
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            blogPostingJsonLd(article),
            breadcrumbJsonLd([
              { name: t.breadcrumbHome, path: "/" },
              { name: t.breadcrumbBlog, path: "/blog" },
              { name: article.title, path: `/blog/${article.slug}` }
            ])
          ])
        }}
      />
    </>
  );
}
