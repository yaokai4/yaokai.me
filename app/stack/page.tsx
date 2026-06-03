import { Layers3, Radar, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { SkillRadar } from "@/components/site/SkillRadar";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getResources, getSkills } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "技术栈 - 姚凯",
  description: "用技术雷达的方式展示我在前端、后端、数据库、AI、设计、部署和自动化上的工具体系。",
  path: "/stack"
});

const stackNarratives = [
  {
    title: "前端体验",
    icon: Sparkles,
    description: "我关注的不只是页面能运行，而是信息层级、交互反馈、动效节奏和移动端阅读体验能否共同服务用户目标。"
  },
  {
    title: "系统工程",
    icon: Layers3,
    description: "从数据库模型、API 契约、后台管理到部署脚本，我倾向于把项目做成能长期维护和持续迭代的产品系统。"
  },
  {
    title: "AI 工作流",
    icon: Radar,
    description: "我把 AI 当成产品、设计、开发和内容沉淀的协作层，用它提升速度，但最终判断仍由真实用户体验和工程质量负责。"
  }
];

export default async function StackPage() {
  const [skills, resources] = await Promise.all([getSkills(), getResources()]);
  const featuredResources = resources.filter((resource) => resource.featured).slice(0, 6);
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));

  return (
    <>
      <PageHeader
        eyebrow="技术栈"
        title="不是 Logo 墙，而是一套能把想法落地的技术雷达。"
        description="这里展示我如何组合前端、后端、数据库、部署、设计工具、AI 工具和自动化能力，构建真实可用的数字产品。"
      />

      <section className="section-container grid gap-5 py-12 md:grid-cols-3">
        {stackNarratives.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="premium-glass-card rounded-md p-5">
              <Icon className="h-5 w-5 text-cyan-700" />
              <h2 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="section-container grid gap-8 py-12 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <SectionHeader
            eyebrow="技能地图"
            title="按能力类型组织，而不是堆技术名词。"
            description="每项技术都要回答三个问题：我用它做什么、为什么选择它、它如何服务真实项目。"
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category}>{category}</Badge>
            ))}
          </div>
        </div>
        <SkillRadar skills={skills} />
      </section>

      <section className="section-container py-14">
        <SectionHeader
          eyebrow="相关资源"
          title="这些工具和文档构成我的长期工作台。"
          description="技术栈不是静态清单，而是会随着项目复杂度、产品目标和团队协作方式不断进化。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredResources.map((resource) => (
            <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="premium-glass-card group block rounded-md p-5">
              <div className="flex items-center justify-between gap-4">
                <Badge>{resource.category}</Badge>
                <span className="text-xs text-cyan-700">打开资源</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{resource.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{resource.useCase}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
