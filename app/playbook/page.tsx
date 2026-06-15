import { ArrowRight, BrainCircuit, CheckCircle2, Sparkles, Workflow } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getPlaybooks } from "@/lib/data";
import { withLocalePath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();

  return createMetadata({
    title: "方法论 - 姚凯",
    description: "关于产品判断、开发流程、AI 协作、Machi 双端同步、离线优先 iOS 和项目复盘的方法论。",
    path: "/playbook",
    locale
  });
}

export default async function PlaybookPage() {
  const [locale, playbooks] = await Promise.all([getRequestLocale(), getPlaybooks()]);

  return (
    <>
      <PageHeader
        eyebrow="Playbook"
        title="把做项目时的关键判断，变成下一次可以直接使用的方法论。"
        description="每一条方法论都对应一个真实场景：如何取舍功能、推进开发、协作 AI、同步 Machi 双端、设计离线优先 iOS，以及复盘项目。"
      />
      <section className="section-container py-12">
        <div className="gradient-border-card grid gap-8 rounded-md p-6 md:p-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <Badge>Operating Board</Badge>
            <h2 className="mt-5 text-balance text-4xl font-black leading-tight text-slate-950 md:text-5xl">从模糊问题到可上线结果，我会先搭一张判断板。</h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              每个 Playbook 都不是口号，而是我在产品原型、Machi 双端同步、离线优先 iOS、AI 协作、上线验收和项目复盘里反复使用的拆解方式。
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {([
              ["Frame", "写清问题、对象和成功信号", Workflow],
              ["Build", "把模型、接口、界面接起来", BrainCircuit],
              ["Verify", "用构建、浏览器和复盘验收", Sparkles]
            ] as const).map(([title, detail, Icon]) => (
              <div key={String(title)} className="rounded-md border border-[#DAE2EA] bg-white p-4 shadow-sm">
                <Icon className="h-5 w-5 text-indigo-700" />
                <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-container grid gap-5 pb-20 pt-6 md:grid-cols-2">
        {playbooks.map((playbook) => (
          <article id={playbook.slug} key={playbook.id} className="premium-glass-card scroll-mt-28 rounded-md p-5">
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
            <p className="mt-5 rounded-md border border-slate-200/70 bg-white p-3 text-sm leading-7 text-slate-600">{playbook.example}</p>
            <Link href={withLocalePath("/guide", locale)} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-indigo-700 focus-ring">
              连接到指南
              <ArrowRight className="h-4 w-4" />
            </Link>
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
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-indigo-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
