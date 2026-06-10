import { ArrowRight, BrainCircuit, CheckCircle2, Compass, Layers3, Palette, Sparkles, Workflow } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getManifestoItems, getNowRecords, getSettings, getSkills, getTimelineItems } from "@/lib/data";
import { withLocalePath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();

  return createMetadata({
    title: "关于我 - 姚凯",
    description: "个人定位、价值观、成长路径、能力结构与当前关注方向。",
    path: "/about",
    locale
  });
}

const storyBlocks = [
  {
    title: "我是谁",
    icon: Sparkles,
    text: "我目前在日本做 IT 和 Web / 全栈开发，长期关注产品系统、视觉体验、内容表达和 AI 工作流。比起把网站做成简历，我更愿意把它做成一个持续公开作品、判断和复盘的数字产品。"
  },
  {
    title: "我能创造什么价值",
    icon: Layers3,
    text: "我擅长把模糊想法拆成产品结构，把结构做成有质感的界面，把界面接到数据、后台、权限和部署，再用文章、指南和复盘让项目经验持续留下证据。"
  },
  {
    title: "我的工作方式",
    icon: Workflow,
    text: "先定义目标用户、成功信号、边界和不可妥协的质量标准，再进入原型、实现、验证和复盘。AI 会参与研究、拆解和检查，但不会替代关键判断。"
  }
];

const operatingPrinciples = [
  ["产品清晰度", "先弄清楚为什么做、给谁用、怎样算有效，避免把精力浪费在看似丰富但无效的功能上。"],
  ["工程可靠性", "数据模型、接口边界、后台管理、权限和部署脚本要能长期支撑作品，而不是只支撑一次演示。"],
  ["设计审美", "视觉不是装饰，是信息层级、信任感、探索欲和品牌记忆共同形成的结果。"],
  ["AI 协作", "让 AI 加速探索、起草、实现和检查，但每一步都要回到项目目标、运行结果和人工质量判断。"]
];

export default async function AboutPage() {
  const [locale, settings, skills, timeline, nowItems, manifestoItems] = await Promise.all([
    getRequestLocale(),
    getSettings(),
    getSkills(),
    getTimelineItems(),
    getNowRecords(),
    getManifestoItems()
  ]);

  return (
    <>
      <PageHeader
        eyebrow="关于我"
        title="我在日本做 IT，也在把工程、设计、内容和 AI 工作流沉淀成长期作品。"
        description="我关注可上线的产品系统、稳定的工程结构、有记忆点的界面、具体的产品判断，以及能让高质量工作持续发生的 AI 协作方式。"
      />

      <section className="section-container grid gap-8 py-16 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="premium-glass-card grid content-between rounded-md p-6">
          <div>
            <div className="relative h-44 w-44 overflow-hidden rounded-md border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-inner">
              <Image src={settings.avatarUrl || "/images/avatar-yaokai.svg"} alt={settings.siteName || "姚凯"} fill className="object-cover p-5" sizes="176px" />
            </div>
            <h2 className="mt-7 text-4xl font-black text-slate-950">{settings.siteName || "姚凯"}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Japan · IT · Creative Engineering · AI Workflow
            </p>
          </div>
          <Link href={withLocalePath("/contact", locale)} className="mt-8 inline-flex">
            <Button>
              开始沟通
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </aside>

        <div className="grid gap-4">
          {storyBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <article key={block.title} className="premium-glass-card rounded-md p-6">
                <Icon className="h-5 w-5 text-indigo-700" />
                <h2 className="mt-5 text-2xl font-black text-slate-950">{block.title}</h2>
                <p className="mt-3 text-base leading-8 text-slate-600">{block.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-container py-16">
        <div className="mb-9 max-w-3xl">
          <Badge>能力结构</Badge>
          <h2 className="mt-4 text-balance text-4xl font-black text-slate-950 md:text-5xl">这些能力不是分散标签，而是会互相复利。</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {skills.slice(0, 8).map((skill) => (
            <article key={skill.id} className="gradient-border-card rounded-md p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-black text-slate-950">{skill.name}</span>
                <span className="text-xs font-black text-indigo-700">{skill.level}%</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{skill.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-container grid gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <Badge>工作方式</Badge>
          <h2 className="mt-4 text-balance text-4xl font-black text-slate-950 md:text-5xl">我习惯把复杂事情拆成可验证、可交付、可复盘的步骤。</h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            这套方式适合产品原型、后台工具、AI 工作流、Machi 这类双端项目和个人品牌网站：先建立判断框架，再进入实现、验收和打磨。
          </p>
        </div>
        <div className="grid gap-4">
          {operatingPrinciples.map(([title, text], index) => {
            const icons = [Compass, CheckCircle2, Palette, BrainCircuit];
            const Icon = icons[index];
            return (
              <article key={title} className="premium-glass-card flex gap-4 rounded-md p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-gradient-to-br from-indigo-100 via-white to-sky-100 text-indigo-800">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-container grid gap-12 py-16 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <Badge>时间线</Badge>
          <h2 className="mt-4 text-balance text-4xl font-black text-slate-950 md:text-5xl">一条由构建、学习、复盘和迭代塑造的路径。</h2>
          <div className="mt-8 grid gap-4">
            {timeline.map((item, index) => (
              <article key={item.id} className="premium-glass-card grid gap-4 rounded-md p-5 md:grid-cols-[96px_1fr]">
                <div>
                  <span className="text-xs font-black text-indigo-700">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-2 text-xl font-black text-slate-950">{item.date}</p>
                </div>
                <div>
                  <Badge>{item.type}</Badge>
                  <h3 className="mt-4 text-xl font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="grid content-start gap-8">
          <div>
            <Badge>当前状态</Badge>
            <div className="mt-5 grid gap-4">
              {nowItems.slice(0, 4).map((item) => (
                <article key={item.id} className="premium-glass-card rounded-md p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-black text-indigo-700">{item.type}</span>
                    <span className="text-xs font-bold text-slate-500">{item.status}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
          <div>
            <Badge>价值观</Badge>
            <div className="mt-5 grid gap-4">
              {manifestoItems.slice(0, 3).map((item) => (
                <article key={item.id} className="premium-glass-card rounded-md p-5">
                  <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.content}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
