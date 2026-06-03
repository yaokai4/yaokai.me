"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/State";
import { FilterTabs } from "@/components/site/FilterTabs";
import { SearchInput } from "@/components/site/SearchInput";

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
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("全部");
  const categories = React.useMemo(() => ["全部", ...Array.from(new Set(guides.map((guide) => guide.category)))], [guides]);

  const filtered = guides.filter((guide) => {
    const haystack = `${guide.title} ${guide.excerpt} ${guide.category} ${guide.tags.join(" ")} ${guide.audience}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === "全部" || guide.category === category);
  });

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="搜索指南、技术栈或适合人群" />
        <FilterTabs items={categories} value={category} onChange={setCategory} />
      </div>
      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : (
        <EmptyState title="没有找到指南" description="换一个关键词或分类试试。" />
      )}
    </div>
  );
}

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link href={`/guide/${guide.slug}`} className="premium-glass-card group block rounded-md p-5">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <Badge>{guide.category}</Badge>
        <span>{guide.difficulty}</span>
        <span>{guide.readingTime}</span>
      </div>
      <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">{guide.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{guide.excerpt}</p>
      <p className="mt-4 text-xs text-slate-500">适合：{guide.audience}</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {guide.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs font-medium text-cyan-700">#{tag}</span>
          ))}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
      </div>
    </Link>
  );
}
