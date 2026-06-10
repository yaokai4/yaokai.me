import { Quote, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getManifestoItems } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();

  return createMetadata({
    title: "宣言 - 姚凯",
    description: "关于技术、审美、AI、长期主义、产品判断和创造证据的个人原则。",
    path: "/manifesto",
    locale
  });
}

export default async function ManifestoPage() {
  const items = await getManifestoItems();

  return (
    <>
      <PageHeader
        eyebrow="宣言"
        title="我相信什么，就用什么方式构建。"
        description="这些原则解释我为什么重视工程可靠性、产品判断、设计审美、AI 协作、真实证据和长期可维护系统。"
      />
      <section className="section-container py-16">
        <div className="liquid-panel rounded-md border border-white/72 bg-white/72 p-6 shadow-[0_34px_120px_rgba(71,85,105,0.14)] backdrop-blur-2xl md:p-10">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <Badge>Principles Wall</Badge>
              <h2 className="mt-5 text-balance text-4xl font-black leading-tight text-slate-950 md:text-5xl">原则不是挂在墙上的句子，而是做取舍时的默认值。</h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                我希望这些句子能解释我为什么在项目里同时关心清晰度、可维护性、审美、AI 协作、真实作品证据和长期生长能力。
              </p>
              <Sparkles className="mt-8 h-8 w-8 text-indigo-700" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item, index) => (
                <article key={item.id} className="rounded-md border border-white/72 bg-white/68 p-5 shadow-sm backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm font-black text-indigo-700">{String(index + 1).padStart(2, "0")}</span>
                    <Quote className="h-5 w-5 text-indigo-300" />
                  </div>
                  <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.content}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
