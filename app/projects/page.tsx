import { PageHeader } from "@/components/site/PageHeader";
import { ProjectExplorer } from "@/components/site/ProjectExplorer";
import { getPublicProjects } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const t = siteCopy[locale].pages.projects;

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/projects",
    locale
  });
}

export default async function ProjectsPage() {
  const locale = await getRequestLocale();
  const t = siteCopy[locale].pages.projects;
  const projects = await getPublicProjects();

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
