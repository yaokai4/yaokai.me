import { BlogExplorer } from "@/components/site/BlogExplorer";
import { PageHeader } from "@/components/site/PageHeader";
import { getPublicArticles } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "文章 - 姚凯",
  description: "关于工程、产品、AI 工作流和设计思考的长文章。",
  path: "/blog"
});

export default async function BlogPage() {
  const articles = await getPublicArticles();

  return (
    <>
      <PageHeader
        eyebrow="文章"
        title="把经验整理成可以复用的思考。"
        description="这里记录工程深度、产品判断、AI 工作流、设计方法和真实构建过程中的复盘。"
      />
      <section className="section-container py-16">
        <BlogExplorer articles={articles} />
      </section>
    </>
  );
}
