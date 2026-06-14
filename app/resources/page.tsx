import { PageHeader } from "@/components/site/PageHeader";
import { ResourceExplorer } from "@/components/site/ResourceExplorer";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { getResources } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).pages.resources;

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/resources",
    locale
  });
}

export default async function ResourcesPage() {
  const [locale, resources, copyOverrides] = await Promise.all([getRequestLocale(), getResources(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).pages.resources;

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <section className="section-container py-16">
        <ResourceExplorer resources={resources} />
      </section>
    </>
  );
}
