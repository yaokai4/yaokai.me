"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useLocale } from "@/components/site/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/State";
import { FilterTabs } from "@/components/site/FilterTabs";
import { SearchInput } from "@/components/site/SearchInput";
import { withLocalePath } from "@/lib/i18n";
import { siteCopy } from "@/lib/public-copy";
import { formatStoredReadingTime } from "@/lib/utils";

type Guide = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  difficulty: string;
  audience: string;
  readingTime: string;
  featured: boolean;
};

export function GuideExplorer({ guides }: { guides: Guide[] }) {
  const { locale } = useLocale();
  const copy = siteCopy[locale];
  const t = copy.explorers.guide;
  const allLabel = copy.common.all;
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>(allLabel);
  const categories = React.useMemo(() => [allLabel, ...Array.from(new Set(guides.map((guide) => guide.category)))], [allLabel, guides]);
  const activeCategory = categories.includes(category) ? category : allLabel;

  const filtered = guides.filter((guide) => {
    const haystack = `${guide.title} ${guide.excerpt} ${guide.category} ${guide.tags.join(" ")} ${guide.audience}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (activeCategory === allLabel || guide.category === activeCategory);
  });
  const featuredGuide = filtered.find((guide) => guide.featured) || filtered[0];
  const restGuides = featuredGuide ? filtered.filter((guide) => guide.id !== featuredGuide.id) : [];

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
          {featuredGuide ? <FeaturedGuide guide={featuredGuide} /> : null}
          <div className="grid gap-5 md:grid-cols-2">
            {restGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      )}
    </div>
  );
}

function FeaturedGuide({ guide }: { guide: Guide }) {
  const { locale } = useLocale();
  const t = siteCopy[locale].explorers.guide;

  return (
    <Link href={withLocalePath(`/guide/${guide.slug}`, locale)} className="gradient-border-card group grid overflow-hidden rounded-md p-0 lg:grid-cols-[0.82fr_1.18fr]">
      <div className="relative min-h-[260px] overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(199,210,254,0.42),transparent_38%),radial-gradient(circle_at_88%_18%,rgba(186,230,253,0.36),transparent_36%),linear-gradient(135deg,#f8fafc,#f6fdff)] p-6">
        <div className="absolute inset-4 rounded-md border border-[#DAE2EA] bg-white" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="grid h-14 w-14 place-items-center rounded-md border border-[#DAE2EA] bg-white text-indigo-700 shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-indigo-700">{t.featured}</p>
            <p className="mt-2 text-sm font-bold text-slate-600">{guide.category} · {formatStoredReadingTime(guide.readingTime, locale)}</p>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{guide.difficulty}</Badge>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700"><Sparkles className="h-3.5 w-3.5" /> {t.recommended}</span>
        </div>
        <h3 className="mt-6 text-balance text-3xl font-black leading-tight text-slate-950 md:text-4xl">{guide.title}</h3>
        <p className="mt-4 text-base leading-8 text-slate-600">{guide.excerpt}</p>
        <p className="mt-5 rounded-md border border-[#DAE2EA] bg-white p-3 text-sm leading-6 text-slate-600">{t.audiencePrefix}{guide.audience}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
          {t.enter}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function GuideCard({ guide }: { guide: Guide }) {
  const { locale } = useLocale();
  const t = siteCopy[locale].explorers.guide;

  return (
    <Link href={withLocalePath(`/guide/${guide.slug}`, locale)} className="premium-glass-card group block rounded-md p-5">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <Badge>{guide.category}</Badge>
        <span>{guide.difficulty}</span>
        <span>{formatStoredReadingTime(guide.readingTime, locale)}</span>
      </div>
      <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">{guide.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{guide.excerpt}</p>
      <p className="mt-4 text-xs text-slate-500">{t.audiencePrefix}{guide.audience}</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {guide.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-indigo-200/70 bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-700">{tag}</span>
          ))}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
      </div>
    </Link>
  );
}
