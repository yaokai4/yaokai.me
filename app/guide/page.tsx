import { GuideExplorer } from "@/components/site/GuideExplorer";
import { PageHeader } from "@/components/site/PageHeader";
import { getPublicGuides } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const t = siteCopy[locale].pages.guide;

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/guide",
    locale
  });
}

export default async function GuidePage() {
  const locale = await getRequestLocale();
  const t = siteCopy[locale].pages.guide;
  const guides = await getPublicGuides();

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
