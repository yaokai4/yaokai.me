"use client";

import * as React from "react";
import { BlogCard } from "@/components/site/BlogCard";
import { FilterTabs } from "@/components/site/FilterTabs";
import { SearchInput } from "@/components/site/SearchInput";
import { EmptyState } from "@/components/ui/State";

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
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("全部");
  const categories = React.useMemo(() => ["全部", ...Array.from(new Set(articles.map((article) => article.category)))], [articles]);

  const filtered = articles.filter((article) => {
    const haystack = `${article.title} ${article.excerpt} ${article.category} ${article.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === "全部" || article.category === category);
  });

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="搜索文章、标签或分类" />
        <FilterTabs items={categories} value={category} onChange={setCategory} />
      </div>
      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState title="没有找到文章" description="换一个关键词或分类试试。" />
      )}
    </div>
  );
}
