import { GuideExplorer } from "@/components/site/GuideExplorer";
import { PageHeader } from "@/components/site/PageHeader";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { getPublicGuides } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).pages.guide;

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/guide",
    locale
  });
}

export default async function GuidePage() {
  const [locale, guides, copyOverrides] = await Promise.all([getRequestLocale(), getPublicGuides(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).pages.guide;

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <section className="section-container py-16">
        <GuideExplorer guides={guides} />
      </section>
    </>
  );
}
