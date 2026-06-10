import {
  ArrowRight,
  BrainCircuit,
  Brush,
  Code2,
  Compass,
  MessageCircle,
  Rocket,
  Sparkles,
  Workflow
} from "lucide-react";
import Link from "next/link";
import { BlogCard } from "@/components/site/BlogCard";
import { GuideCard } from "@/components/site/GuideExplorer";
import { PageHeader } from "@/components/site/PageHeader";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getContentCollections,
  getNowRecords,
  getPlaybooks,
  getPublicArticles,
  getPublicGuides,
  getPublicProjects,
  getResources,
  getSkills
} from "@/lib/data";
import { withLocalePath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();

  return createMetadata({
    title: "探索 - 姚凯",
    description: "按目标路线探索作品、文章、指南、资源库、方法论和当前状态。",
    path: "/explore",
    locale
  });
}

const recommendedPaths = [
  { title: "想了解我的技术能力", href: "/stack", icon: Code2, detail: "看技术雷达、全栈结构、Machi 双端和部署能力。" },
  { title: "想了解我的 AI 工作流", href: "/guide", icon: BrainCircuit, detail: "从 AI 协作、原型到开发复盘，进入指南库。" },
  { title: "想了解我的产品思维", href: "/playbook", icon: Compass, detail: "看我如何判断功能优先级、成功信号和维护成本。" },
  { title: "想了解我的设计审美", href: "/blog/fluid-gradient-personal-site-principles", icon: Brush, detail: "看明亮流体视觉、卡片、按钮、阅读体验的判断标准。" },
  { title: "想了解我的项目经验", href: "/projects", icon: Rocket, detail: "进入高级 Case Study，查看背景、挑战、方案和结果。" },
  { title: "想合作或联系我", href: "/contact", icon: MessageCircle, detail: "适合产品原型、全栈实现、AI 工作流和个人品牌网站。" }
];

export default async function ExplorePage() {
  const [locale, collections, guides, projects, articles, resources, playbooks, nowItems, skills] = await Promise.all([
    getRequestLocale(),
    getContentCollections(),
    getPublicGuides(),
    getPublicProjects(),
    getPublicArticles(),
    getResources(),
    getPlaybooks(),
    getNowRecords(),
    getSkills()
  ]);

  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const featuredGuides = guides.filter((guide) => guide.featured).slice(0, 3);
  const latestArticles = articles.slice(0, 3);
  const featuredResources = resources.filter((resource) => resource.featured).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow="探索"
        title="选择一条路线，进入一个被认真策展的内容地图。"
        description="你可以从技术能力、AI 工作流、产品思维、设计审美、项目经验或合作意向进入，沿着项目、文章、指南、资源和方法论继续探索。"
      />

      <section className="wide-container relative pt-14">
        <div className="premium-glass-card relative overflow-hidden rounded-md p-4 md:p-6">
          <div className="absolute inset-x-8 top-1/2 hidden h-px -translate-y-1/2 bg-[#DAE2EA] lg:block" />
          <div className="relative grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            {recommendedPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <Link key={path.href} href={withLocalePath(path.href, locale)} className="group rounded-md border border-[#DAE2EA] bg-white p-4 shadow-[0_1px_2px_rgba(15,45,78,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-300 focus-ring">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md border border-indigo-100 bg-indigo-50/60 text-indigo-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-black text-indigo-700">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h2 className="mt-5 text-lg font-black leading-tight text-slate-950">{path.title}</h2>
                  <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-600">{path.detail}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-container py-16">
        <SectionHeader
          eyebrow="推荐路径"
          title="你想先看哪一种能力证据？"
          description="每条路径都不是孤立页面，而是把项目、文章、指南、方法论和资源连接成一条可继续深入的线索。"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendedPaths.map((path) => {
            const Icon = path.icon;
            return (
              <Link key={path.href} href={withLocalePath(path.href, locale)} className="premium-glass-card group block rounded-md p-5">
                <div className="grid h-12 w-12 place-items-center rounded-md border border-indigo-100 bg-indigo-50/60 text-indigo-800">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-7 text-2xl font-black text-slate-950">{path.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{path.detail}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-700">
                  进入路线
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section-container py-16">
        <SectionHeader
          eyebrow="主题路线"
          title="内容不只是列表，而是可以被理解和验证的路径。"
          description="这些路线会把真实项目、长文章、指南和方法论连接成完整上下文，让访问者更快建立判断。"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {collections.map((collection) => (
            <article key={collection.id} className="gradient-border-card rounded-md p-5">
              <div className="flex items-center justify-between gap-4">
                <Badge>{collection.type}</Badge>
                {collection.featured ? <span className="text-xs font-bold text-indigo-700">精选路线</span> : null}
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">{collection.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{collection.description}</p>
              <p className="mt-5 text-xs font-bold text-slate-400">{collection.itemIds.length} 个关联内容节点</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-container grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeader eyebrow="精选项目" title="先看可以证明判断与执行力的作品。" />
          <div className="grid gap-4">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="精选指南" title="再看可以复用的方法。" />
          <div className="grid gap-4">
            {featuredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-container grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeader eyebrow="技能地图" title="能力结构不靠堆词，而靠真实项目支撑。" />
          <div className="grid gap-3">
            {skills.slice(0, 8).map((skill) => (
              <div key={skill.id} className="rounded-md border border-[#DAE2EA] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-slate-950">{skill.name}</span>
                  <span className="text-xs font-bold text-indigo-700">{skill.category} · {skill.level}%</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="最新思考" title="从文章进入真实判断过程。" />
          <div className="grid gap-4">
            {latestArticles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-container grid gap-12 py-16 lg:grid-cols-[1fr_1fr_0.9fr]">
        <div>
          <SectionHeader eyebrow="方法论" title="我如何把事情推进到可交付。" />
          <div className="grid gap-4">
            {playbooks.slice(0, 3).map((playbook) => (
              <Link key={playbook.id} href={withLocalePath("/playbook", locale)} className="premium-glass-card block rounded-md p-5">
                <Workflow className="h-5 w-5 text-indigo-700" />
                <h3 className="mt-5 text-xl font-black text-slate-950">{playbook.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{playbook.scenario}</p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="资源库" title="工具和资料也是能力的一部分。" />
          <div className="grid gap-4">
            {featuredResources.map((resource) => (
              <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="premium-glass-card block rounded-md p-5">
                <Badge>{resource.category}</Badge>
                <h3 className="mt-5 text-xl font-black text-slate-950">{resource.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{resource.useCase}</p>
              </a>
            ))}
          </div>
        </div>
        <aside>
          <SectionHeader eyebrow="Now" title="当前状态。" />
          <div className="grid gap-4">
            {nowItems.slice(0, 4).map((item) => (
              <article key={item.id} className="premium-glass-card rounded-md p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge>{item.type}</Badge>
                  <span className="text-xs font-bold text-indigo-700">{item.status}</span>
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="section-container pb-24 pt-10">
        <div className="liquid-panel rounded-md border border-[#DAE2EA] bg-white p-6 shadow-[0_1px_2px_rgba(15,45,78,0.04)] md:p-10">
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Badge>Contact</Badge>
              <h2 className="mt-5 text-balance text-4xl font-black leading-tight text-slate-950 md:text-5xl">
                已经看到感兴趣的方向？从一次清晰沟通开始。
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                我适合参与需要工程实现、AI 工作流、产品判断和高级前台体验同时在线的项目。
              </p>
            </div>
            <Link href={withLocalePath("/contact", locale)} className="magnetic-button inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-bold text-white shadow-[0_1px_2px_rgba(15,45,78,0.04)] transition hover:-translate-y-0.5 hover:bg-slate-800 focus-ring">
              开始联系
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
