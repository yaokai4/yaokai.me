"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/State";
import { FilterTabs } from "@/components/site/FilterTabs";
import { SearchInput } from "@/components/site/SearchInput";

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
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("全部");
  const categories = React.useMemo(() => ["全部", ...Array.from(new Set(resources.map((resource) => resource.category)))], [resources]);

  const filtered = resources.filter((resource) => {
    const haystack = `${resource.title} ${resource.description} ${resource.category} ${resource.reason} ${resource.useCase} ${resource.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === "全部" || resource.category === category);
  });

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="搜索资源、技术或使用场景" />
        <FilterTabs items={categories} value={category} onChange={setCategory} />
      </div>
      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((resource) => (
            <Link key={resource.id} href={resource.url} target="_blank" className="premium-glass-card group block rounded-md p-5">
              <div className="flex items-center justify-between gap-4">
                <Badge>{resource.category}</Badge>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-600" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-slate-950">{resource.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{resource.reason}</p>
              <p className="mt-4 rounded-md border border-slate-200/70 bg-white/60 p-3 text-xs leading-6 text-slate-500">使用场景：{resource.useCase}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span key={tag} className="text-xs font-medium text-cyan-700">#{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="没有找到资源" description="换一个关键词或分类试试。" />
      )}
    </div>
  );
}
