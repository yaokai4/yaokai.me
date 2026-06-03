import { PageHeader } from "@/components/site/PageHeader";
import { ResourceExplorer } from "@/components/site/ResourceExplorer";
import { getResources } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "资源库 - 姚凯",
  description: "开发、设计、AI 工作流与 Machi 双端工程相关资源。",
  path: "/resources"
});

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <>
      <PageHeader
        eyebrow="资源库"
        title="我长期使用和参考的工具、文档与技术资源。"
        description="这里包括 AI 协作工具、Next.js/React/Prisma、SwiftUI/SwiftData、Python、SQLite，以及用于产品和视觉判断的参考资源。"
      />
      <section className="section-container py-16">
        <ResourceExplorer resources={resources} />
      </section>
    </>
  );
}
