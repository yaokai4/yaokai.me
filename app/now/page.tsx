import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getNowRecords } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "当前状态 - 姚凯",
  description: "我现在正在投入的项目、研究、学习和下一步计划。",
  path: "/now"
});

export default async function NowPage() {
  const items = await getNowRecords();

  return (
    <>
      <PageHeader
        eyebrow="Now"
        title="我现在正在投入什么。"
        description="这里记录当前项目、正在研究的技术方向、学习内容和下一步计划，包括 Machi 双端项目资料整理、iOS 离线优先架构复盘和 Web 统一后端复盘。"
      />
      <section className="section-container grid gap-5 py-16 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="premium-glass-card rounded-md p-5">
            <div className="flex items-center justify-between gap-4">
              <Badge>{item.type}</Badge>
              <span className="text-xs font-medium text-cyan-700">{item.status}</span>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>
    </>
  );
}
