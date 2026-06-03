import { GuideExplorer } from "@/components/site/GuideExplorer";
import { PageHeader } from "@/components/site/PageHeader";
import { getPublicGuides } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "指南 - 姚凯",
  description: "关于 AI 工作流、全栈开发、iOS 工程、产品判断和设计审美的可复用指南。",
  path: "/guide"
});

export default async function GuidePage() {
  const guides = await getPublicGuides();

  return (
    <>
      <PageHeader
        eyebrow="指南"
        title="把真实项目经验整理成可执行的方法。"
        description="这里收集 AI 协作、Next.js 全栈结构、Machi iOS 离线优先、Machi Web 双端同步、产品判断和设计审美等技术与方法指南。"
      />
      <section className="section-container py-16">
        <GuideExplorer guides={guides} />
      </section>
    </>
  );
}
