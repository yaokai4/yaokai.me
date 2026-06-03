import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogCard } from "@/components/site/BlogCard";
import { MarkdownRenderer } from "@/components/site/MarkdownRenderer";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { TableOfContents } from "@/components/site/TableOfContents";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import { extractToc, getReadingTime } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { normalizeArticle } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return {};

  return createMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    path: `/blog/${article.slug}`,
    image: article.coverImage
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const rawArticle = await prisma.article.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!rawArticle) notFound();

  const article = normalizeArticle(rawArticle);
  const articles = (await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  })).map(normalizeArticle);
  const index = articles.findIndex((item) => item.id === article.id);
  const previous = index > 0 ? articles[index - 1] : null;
  const next = index >= 0 && index < articles.length - 1 ? articles[index + 1] : null;
  const related = articles.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 2);
  const toc = extractToc(article.content);

  return (
    <>
      <ReadingProgress />
      <section className="section-container pt-32">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-cyan-700">
          <ArrowLeft className="h-4 w-4" />
          返回文章
        </Link>
        <div className="mt-8 max-w-4xl">
          <Badge>{article.category}</Badge>
          <h1 className="mt-6 text-balance text-5xl font-black leading-tight text-slate-950 md:text-7xl">{article.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>{formatDate(article.publishedAt)}</span>
            <span>{getReadingTime(article.content)}</span>
            {article.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
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
          <Link href={`/blog/${previous.slug}`} className="premium-glass-card rounded-md p-5">
            <p className="text-sm font-bold text-slate-500">上一篇</p>
            <p className="mt-2 font-black text-slate-950">{previous.title}</p>
          </Link>
        ) : null}
        {next ? (
          <Link href={`/blog/${next.slug}`} className="premium-glass-card rounded-md p-5 md:text-right">
            <p className="text-sm font-bold text-slate-500">下一篇</p>
            <p className="mt-2 font-black text-slate-950">{next.title}</p>
          </Link>
        ) : null}
      </section>

      {related.length ? (
        <section className="section-container pb-24">
          <h2 className="mb-6 text-2xl font-black text-slate-950">相关文章</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {related.map((item) => (
              <BlogCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
