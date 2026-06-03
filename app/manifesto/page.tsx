import { PageHeader } from "@/components/site/PageHeader";
import { getManifestoItems } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "宣言 - 姚凯",
  description: "关于技术、审美、AI、长期主义和创造证据的个人原则。",
  path: "/manifesto"
});

export default async function ManifestoPage() {
  const items = await getManifestoItems();

  return (
    <>
      <PageHeader
        eyebrow="宣言"
        title="我相信什么，就如何构建。"
        description="这些原则解释我为什么重视工程可靠性、产品判断、设计审美、AI 协作和长期可维护系统。"
      />
      <section className="section-container grid gap-5 py-16 md:grid-cols-2">
        {items.map((item, index) => (
          <article key={item.id} className="premium-glass-card rounded-md p-6">
            <span className="text-sm font-semibold text-cyan-700">{String(index + 1).padStart(2, "0")}</span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.content}</p>
          </article>
        ))}
      </section>
    </>
  );
}
