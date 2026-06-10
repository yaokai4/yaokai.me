"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Blocks, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/State";
import { FilterTabs } from "@/components/site/FilterTabs";
import { SearchInput } from "@/components/site/SearchInput";
import { useLocale } from "@/components/site/LocaleProvider";
import { siteCopy } from "@/lib/public-copy";

type Resource = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  reason: string;
  useCase: string;
  featured: boolean;
};

export function ResourceExplorer({ resources }: { resources: Resource[] }) {
  const { locale } = useLocale();
  const copy = siteCopy[locale];
  const t = copy.explorers.resources;
  const allLabel = copy.common.all;
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>(allLabel);
  const categories = React.useMemo(() => [allLabel, ...Array.from(new Set(resources.map((resource) => resource.category)))], [allLabel, resources]);
  const activeCategory = categories.includes(category) ? category : allLabel;

  const filtered = resources.filter((resource) => {
    const haystack = `${resource.title} ${resource.description} ${resource.category} ${resource.reason} ${resource.useCase} ${resource.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (activeCategory === allLabel || resource.category === activeCategory);
  });
  const featuredResource = filtered.find((resource) => resource.featured) || filtered[0];
  const restResources = featuredResource ? filtered.filter((resource) => resource.id !== featuredResource.id) : [];

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
          {featuredResource ? <FeaturedResource resource={featuredResource} /> : null}
          <div className="grid gap-5 md:grid-cols-2">
            {restResources.map((resource) => (
            <Link key={resource.id} href={resource.url} target="_blank" className="premium-glass-card group block rounded-md p-5">
              <div className="flex items-center justify-between gap-4">
                <Badge>{resource.category}</Badge>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-600" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-slate-950">{resource.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{resource.reason}</p>
              <p className="mt-4 rounded-md border border-slate-200/70 bg-white p-3 text-xs leading-6 text-slate-500">{t.useCasePrefix}{resource.useCase}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {resource.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-indigo-200/70 bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-700">#{tag}</span>
                ))}
              </div>
            </Link>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      )}
    </div>
  );
}

function FeaturedResource({ resource }: { resource: Resource }) {
  const { locale } = useLocale();
  const t = siteCopy[locale].explorers.resources;

  return (
    <Link href={resource.url} target="_blank" className="gradient-border-card group grid overflow-hidden rounded-md p-0 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="relative min-h-[240px] overflow-hidden bg-[radial-gradient(circle_at_22%_12%,rgba(199,210,254,0.42),transparent_36%),radial-gradient(circle_at_84%_8%,rgba(186,230,253,0.38),transparent_38%),linear-gradient(135deg,#f8fafc,#f7fdff)] p-6">
        <div className="absolute inset-4 rounded-md border border-[#DAE2EA] bg-white" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="grid h-14 w-14 place-items-center rounded-md border border-[#DAE2EA] bg-white text-indigo-700 shadow-sm">
            <Wrench className="h-6 w-6" />
          </div>
          <div className="rounded-md border border-[#DAE2EA] bg-white p-4 shadow-sm">
            <Blocks className="h-5 w-5 text-indigo-700" />
            <p className="mt-3 text-xs font-black uppercase text-slate-500">{t.workbench}</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{resource.category}</p>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <Badge>{resource.category}</Badge>
        <h3 className="mt-6 text-balance text-3xl font-black leading-tight text-slate-950 md:text-4xl">{resource.title}</h3>
        <p className="mt-4 text-base leading-8 text-slate-600">{resource.reason}</p>
        <p className="mt-5 rounded-md border border-[#DAE2EA] bg-white p-3 text-sm leading-6 text-slate-600">{t.useCasePrefix}{resource.useCase}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
          {t.open}
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
