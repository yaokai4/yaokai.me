import { Clock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getNowRecords } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();

  return createMetadata({
    title: "当前状态 - 姚凯",
    description: "我现在正在投入的项目、研究、学习、复盘和下一步计划。",
    path: "/now",
    locale
  });
}

export default async function NowPage() {
  const items = await getNowRecords();

  return (
    <>
      <PageHeader
        eyebrow="Now"
        title="我现在真正投入的事情，而不是静态简介。"
        description="这里记录当前项目、研究方向、学习内容和下一步计划，包括 Machi 双端资料整理、iOS 离线优先架构复盘、Web 统一后端复盘和 AI 工作流沉淀。"
      />
      <section className="section-container grid gap-10 py-16 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="gradient-border-card sticky top-28 h-fit rounded-md p-6">
          <Sparkles className="h-6 w-6 text-indigo-700" />
          <h2 className="mt-5 text-balance text-4xl font-black leading-tight text-slate-950">这是一个活页，用来证明网站仍在生长。</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            我会把正在打磨的网站、Machi 项目资料、AI 协作流程和视觉学习都放在这里，让访问者看到最近真正投入在哪里。
          </p>
        </aside>
        <div className="relative grid gap-5">
          <div className="absolute bottom-0 left-[17px] top-0 hidden w-px bg-gradient-to-b from-indigo-300 via-sky-300 to-transparent md:block" />
          {items.map((item, index) => (
            <article key={item.id} className="premium-glass-card relative rounded-md p-5 md:ml-12">
              <div className="absolute -left-[52px] top-5 hidden h-9 w-9 place-items-center rounded-md border border-indigo-200/70 bg-white/82 text-indigo-700 shadow-sm backdrop-blur md:grid">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Badge>{item.type}</Badge>
                <span className="text-xs font-bold text-indigo-700">{item.status}</span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">{String(index + 1).padStart(2, "0")} · {item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
