"use client";

import * as React from "react";
import { FilterTabs } from "@/components/site/FilterTabs";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SearchInput } from "@/components/site/SearchInput";
import { useLocale } from "@/components/site/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/State";
import { localizeProjects } from "@/lib/project-localization";
import { siteCopy } from "@/lib/public-copy";

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
  const { locale } = useLocale();
  const copy = siteCopy[locale];
  const t = copy.explorers.projects;
  const allLabel = copy.common.all;
  const localizedProjects = React.useMemo(() => localizeProjects(projects, locale), [projects, locale]);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>(allLabel);
  const categories = React.useMemo(() => [allLabel, ...Array.from(new Set(localizedProjects.map((project) => project.category)))], [allLabel, localizedProjects]);
  const activeCategory = categories.includes(category) ? category : allLabel;

  const filtered = localizedProjects.filter((project) => {
    const haystack = `${project.title} ${project.excerpt} ${project.category} ${project.techStack.join(" ")}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesCategory = activeCategory === allLabel || project.category === activeCategory;
    return matchesQuery && matchesCategory;
  });
  const featuredProject = filtered.find((project) => project.featured) || filtered[0];
  const restProjects = featuredProject ? filtered.filter((project) => project.id !== featuredProject.id) : [];

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
          {featuredProject ? <ProjectCard project={featuredProject} variant="featured" /> : null}
          <div className="grid gap-5 md:grid-cols-2">
          {restProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          </div>
        </div>
      ) : (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      )}
    </div>
  );
}
