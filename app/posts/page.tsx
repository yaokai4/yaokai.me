import { PageHeader } from "@/components/site/PageHeader";
import { PostCard } from "@/components/site/PostCard";
import { EmptyState } from "@/components/ui/State";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { getPublicPosts } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";
import { siteCopy } from "@/lib/public-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).pages.posts;

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/posts",
    locale
  });
}

export default async function PostsPage() {
  const [locale, posts, copyOverrides] = await Promise.all([getRequestLocale(), getPublicPosts(), getCopyOverrides()]);
  const t = applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).pages.posts;

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <section className="section-container grid gap-5 py-16">
        {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} locale={locale} />) : <EmptyState title={t.emptyTitle} />}
      </section>
    </>
  );
}
