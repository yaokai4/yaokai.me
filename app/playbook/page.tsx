import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getPlaybooks } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "方法论 - 姚凯",
  description: "关于产品判断、开发流程、AI 协作、Machi 双端同步和离线优先 iOS 的方法论。",
  path: "/playbook"
});

export default async function PlaybookPage() {
  const playbooks = await getPlaybooks();

  return (
    <>
      <PageHeader
        eyebrow="Playbook"
        title="把做项目时的判断变成可复用的方法论。"
        description="每一条方法论都对应一个真实场景：如何取舍功能、推进开发、协作 AI、同步 Machi 双端、设计离线优先 iOS，以及复盘项目。"
      />
      <section className="section-container grid gap-5 py-16 md:grid-cols-2">
        {playbooks.map((playbook) => (
          <article key={playbook.id} className="premium-glass-card rounded-md p-5">
            <div className="flex items-center justify-between gap-4">
              <Badge>{playbook.featured ? "精选" : "方法"}</Badge>
              <span className="text-xs text-slate-500">{playbook.slug}</span>
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">{playbook.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{playbook.scenario}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ListBlock title="原则" items={playbook.principles} />
              <ListBlock title="步骤" items={playbook.steps} />
            </div>
            <p className="mt-5 rounded-md border border-slate-200/70 bg-white/60 p-3 text-sm leading-7 text-slate-600">{playbook.example}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
