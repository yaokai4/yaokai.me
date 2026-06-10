"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, FileText, PenLine } from "lucide-react";
import { BlogCard } from "@/components/site/BlogCard";
import { useLocale } from "@/components/site/LocaleProvider";
import { FilterTabs } from "@/components/site/FilterTabs";
import { SearchInput } from "@/components/site/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/State";
import { getReadingTime } from "@/lib/markdown";
import { withLocalePath } from "@/lib/i18n";
import { siteCopy } from "@/lib/public-copy";
import { formatDate } from "@/lib/utils";

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

export function BlogExplorer({ articles }: { articles: Article[] }) {
  const { locale } = useLocale();
  const copy = siteCopy[locale];
  const t = copy.explorers.blog;
  const allLabel = copy.common.all;
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>(allLabel);
  const categories = React.useMemo(() => [allLabel, ...Array.from(new Set(articles.map((article) => article.category)))], [allLabel, articles]);
  const activeCategory = categories.includes(category) ? category : allLabel;

  const filtered = articles.filter((article) => {
    const haystack = `${article.title} ${article.excerpt} ${article.category} ${article.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (activeCategory === allLabel || article.category === activeCategory);
  });
  const featuredArticle = filtered.find((article) => article.featured) || filtered[0];
  const restArticles = featuredArticle ? filtered.filter((article) => article.id !== featuredArticle.id) : [];

  return (
    <div className="grid gap-8">
      <div className="premium-glass-card grid gap-4 rounded-md p-4 lg:grid-cols-[minmax(280px,0.85fr)_1fr] lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge>{t.count(filtered.length)}</Badge>
            <span className="text-xs font-bold text-slate-500">{t.filterHint}</span>
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder={t.placeholder} clearLabel={copy.common.clearSearch} />
        </div>
        <div className="lg:justify-self-end">
          <FilterTabs items={categories} value={activeCategory} onChange={setCategory} ariaLabel={copy.common.filterAria} />
        </div>
      </div>
      {filtered.length ? (
        <div className="grid gap-5">
          {featuredArticle ? <FeaturedArticle article={featuredArticle} /> : null}
          <div className="grid gap-5 md:grid-cols-2">
            {restArticles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      )}
    </div>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  const { locale } = useLocale();
  const t = siteCopy[locale].explorers.blog;

  return (
    <Link href={withLocalePath(`/blog/${article.slug}`, locale)} className="gradient-border-card group grid overflow-hidden rounded-md p-0 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{article.category}</Badge>
          <span className="text-xs font-bold text-slate-500">{formatDate(article.publishedAt, locale)}</span>
          <span className="text-xs font-bold text-slate-500">{getReadingTime(article.content, locale)}</span>
        </div>
        <h3 className="mt-6 text-balance text-3xl font-black leading-tight text-slate-950 md:text-4xl">{article.title}</h3>
        <p className="mt-4 text-base leading-8 text-slate-600">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {article.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-indigo-200/70 bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-700">{tag}</span>
          ))}
        </div>
        <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
          {t.readMore}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
      <div className="relative min-h-[260px] overflow-hidden bg-[radial-gradient(circle_at_18%_8%,rgba(199,210,254,0.42),transparent_36%),radial-gradient(circle_at_86%_14%,rgba(186,230,253,0.38),transparent_38%),linear-gradient(135deg,#f8fafc,#f6fdff)] p-6">
        <div className="absolute inset-4 rounded-md border border-[#DAE2EA] bg-white" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="grid h-14 w-14 place-items-center rounded-md border border-[#DAE2EA] bg-white text-indigo-700 shadow-sm">
            <PenLine className="h-6 w-6" />
          </div>
          <div className="rounded-md border border-[#DAE2EA] bg-white p-4 shadow-sm">
            <FileText className="h-5 w-5 text-indigo-700" />
            <p className="mt-3 text-xs font-black uppercase text-slate-500">{t.featureKicker}</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{t.featureLead}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
