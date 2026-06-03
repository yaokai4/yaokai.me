import { PageHeader } from "@/components/site/PageHeader";
import { PostCard } from "@/components/site/PostCard";
import { EmptyState } from "@/components/ui/State";
import { getPublicPosts } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "动态 - 姚凯",
  description: "短更新、想法、记录和正在推进的思考。",
  path: "/posts"
});

export default async function PostsPage() {
  const posts = await getPublicPosts();

  return (
    <>
      <PageHeader
        eyebrow="动态"
        title="短想法、构建记录和当下信号。"
        description="这里用于发布更轻量的想法、公告、实验记录和还在形成中的思考。"
      />
      <section className="section-container grid gap-5 py-16">
        {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState title="暂无公开动态" />}
      </section>
    </>
  );
}
