"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/site/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { withLocalePath } from "@/lib/i18n";
import { siteCopy } from "@/lib/public-copy";
import { formatDate, readingTime } from "@/lib/utils";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: Date | null;
  content: string;
  featured: boolean;
};

export function BlogCard({ article }: { article: Article }) {
  const { locale } = useLocale();
  const t = siteCopy[locale].explorers.blog;

  return (
    <Link href={withLocalePath(`/blog/${article.slug}`, locale)} className="premium-glass-card group block rounded-md p-5">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <Badge>{article.category}</Badge>
        <span>{formatDate(article.publishedAt, locale)}</span>
        <span>{readingTime(article.content, locale)}</span>
      </div>
      <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">{article.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-indigo-200/70 bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-700">{tag}</span>
          ))}
        </div>
        <span className="sr-only">{t.readMore}</span>
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" aria-hidden="true" />
      </div>
    </Link>
  );
}
