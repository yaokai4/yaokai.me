import { BlogExplorer } from "@/components/site/BlogExplorer";
import { PageHeader } from "@/components/site/PageHeader";
import { getPublicArticles } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const t = siteCopy[locale].pages.blog;

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/blog",
    locale
  });
}

export default async function BlogPage() {
  const locale = await getRequestLocale();
  const t = siteCopy[locale].pages.blog;
  const articles = await getPublicArticles();

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <section className="section-container py-16">
        <BlogExplorer articles={articles} />
      </section>
    </>
  );
}
