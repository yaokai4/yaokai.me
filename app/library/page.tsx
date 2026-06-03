import { PageHeader } from "@/components/site/PageHeader";
import { ResourceExplorer } from "@/components/site/ResourceExplorer";
import { getResources } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "资源库 - 姚凯",
  description: "我长期使用、参考和推荐的开发、设计、AI、产品与内容资源。",
  path: "/library"
});

export default async function LibraryPage() {
  const resources = await getResources();

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="一个面向创造者的高质量资源库。"
        description="这里不是普通链接收藏，而是我在真实项目中反复使用、验证和参考的工具、文档、设计灵感、AI 工作流与工程资源。"
      />
      <section className="section-container py-16">
        <ResourceExplorer resources={resources} />
      </section>
    </>
  );
}
