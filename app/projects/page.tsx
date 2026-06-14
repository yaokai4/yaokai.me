import { PageHeader } from "@/components/site/PageHeader";
import { ProjectExplorer } from "@/components/site/ProjectExplorer";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { getPublicProjects } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).pages.projects;

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/projects",
    locale
  });
}

export default async function ProjectsPage() {
  const [locale, projects, copyOverrides] = await Promise.all([getRequestLocale(), getPublicProjects(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).pages.projects;

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <section className="section-container py-16">
        <ProjectExplorer projects={projects} />
      </section>
    </>
  );
}
