"use client";

import * as React from "react";
import { FilterTabs } from "@/components/site/FilterTabs";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SearchInput } from "@/components/site/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/State";

type Project = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  techStack: string[];
  featured: boolean;
};

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("全部");
  const categories = React.useMemo(() => ["全部", ...Array.from(new Set(projects.map((project) => project.category)))], [projects]);

  const filtered = projects.filter((project) => {
    const haystack = `${project.title} ${project.excerpt} ${project.category} ${project.techStack.join(" ")}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesCategory = category === "全部" || project.category === category;
    return matchesQuery && matchesCategory;
  });
  const featuredProject = filtered.find((project) => project.featured) || filtered[0];
  const restProjects = featuredProject ? filtered.filter((project) => project.id !== featuredProject.id) : [];

  return (
    <div className="grid gap-8">
      <div className="premium-glass-card grid gap-4 rounded-md p-4 lg:grid-cols-[minmax(280px,0.85fr)_1fr] lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge>{filtered.length} 个案例</Badge>
            <span className="text-xs font-bold text-slate-500">按技术、主题和产品类型筛选</span>
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder="搜索项目、技术栈或分类" />
        </div>
        <div className="lg:justify-self-end">
          <FilterTabs items={categories} value={category} onChange={setCategory} />
        </div>
      </div>
      {filtered.length ? (
        <div className="grid gap-5">
          {featuredProject ? <ProjectCard project={featuredProject} variant="featured" /> : null}
          <div className="grid gap-5 md:grid-cols-2">
          {restProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          </div>
        </div>
      ) : (
        <EmptyState title="没有找到项目" description="换一个关键词或分类试试。" />
      )}
    </div>
  );
}
