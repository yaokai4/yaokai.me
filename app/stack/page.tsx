import { Layers3, Radar, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { SkillRadar } from "@/components/site/SkillRadar";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getResources, getSkills } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const t = stackCopy[locale];

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/stack",
    locale
  });
}

const stackCopy = {
  zh: {
    metaTitle: "技术栈 - 姚凯",
    metaDescription: "用技术雷达展示前端体验、系统工程、AI 工作流、设计、部署与自动化能力如何服务真实项目。",
    eyebrow: "技术栈",
    title: "不是 Logo 墙，而是一套能把想法稳定交付的技术雷达。",
    description: "这里展示我如何组合前端、后端、数据库、部署、设计工具、AI 工具和自动化能力，让一个项目从想法变成可上线、可维护的产品系统。",
    narratives: [
      ["前端体验", "我关注的不只是页面能运行，而是信息层级、交互反馈、动效节奏、移动端阅读和可访问性是否共同服务用户目标。", Sparkles],
      ["系统工程", "从数据库模型、API 契约、后台管理、权限边界到部署脚本，我倾向把项目做成能长期维护和持续迭代的系统。", Layers3],
      ["AI 工作流", "我把 AI 当成产品、设计、开发和内容沉淀的协作层，用它提升速度，但最终由真实体验和工程质量验收。", Radar]
    ],
    skillEyebrow: "技能地图",
    skillTitle: "按能力类型组织，而不是堆技术名词。",
    skillDescription: "每项技术都要回答三个问题：我用它做什么、为什么选择它、它如何服务真实项目。",
    resourceEyebrow: "相关资源",
    resourceTitle: "这些工具和文档构成我的长期工作台。",
    resourceDescription: "技术栈不是静态清单，而是会随着项目复杂度、产品目标和协作方式不断进化。",
    openResource: "查看资源"
  },
  ja: {
    metaTitle: "技術スタック - Yaokai",
    metaDescription: "フロントエンド、システム設計、AI ワークフロー、デザイン、デプロイ、自動化を技術レーダーとして整理。",
    eyebrow: "技術スタック",
    title: "Logo の一覧ではなく、アイデアを安定して届けるための技術レーダー。",
    description: "フロント、バックエンド、データベース、デプロイ、デザインツール、AI ツール、自動化をどう組み合わせるかを整理しています。",
    narratives: [
      ["フロント体験", "動くだけでなく、情報階層、反応、動き、モバイルでの読みやすさが目的に沿っているかを見ます。", Sparkles],
      ["システム設計", "データモデル、API、管理画面、権限、デプロイまで、長く運用できる構造を重視します。", Layers3],
      ["AI ワークフロー", "AI を調査、設計、開発、内容整理の協業層として使い、最終品質は体験と工程で確認します。", Radar]
    ],
    skillEyebrow: "スキルマップ",
    skillTitle: "技術名の羅列ではなく、能力の種類で整理します。",
    skillDescription: "それぞれの技術について、何に使うか、なぜ選ぶか、実案件にどう効くかを見ます。",
    resourceEyebrow: "関連リソース",
    resourceTitle: "長く使う道具と資料が作業台をつくります。",
    resourceDescription: "技術スタックは固定リストではなく、プロジェクトの複雑さと目標に合わせて進化します。",
    openResource: "リソースを見る"
  },
  en: {
    metaTitle: "Stack - Yaokai",
    metaDescription: "A technical radar across front-end experience, systems engineering, AI workflows, design, deployment, and automation.",
    eyebrow: "Stack",
    title: "Not a logo wall, but a technical radar for shipping stable product systems.",
    description: "How I combine front end, back end, databases, deployment, design tools, AI tools, and automation to move an idea toward a shippable, maintainable product.",
    narratives: [
      ["Front-end experience", "I care whether hierarchy, feedback, motion, mobile reading, and accessibility serve the user goal, not just whether the page works.", Sparkles],
      ["Systems engineering", "From data models and API contracts to admin tools, permissions, and deployment scripts, I build for long-term maintenance.", Layers3],
      ["AI workflow", "I use AI as a collaboration layer for product, design, development, and content, then validate quality through real experience and engineering checks.", Radar]
    ],
    skillEyebrow: "Skill Map",
    skillTitle: "Organized by capability, not by technology names.",
    skillDescription: "Each tool should answer what I use it for, why I choose it, and how it supports real projects.",
    resourceEyebrow: "Related Resources",
    resourceTitle: "These tools and docs form my long-term workbench.",
    resourceDescription: "A stack is not a static list. It evolves with project complexity, product goals, and collaboration style.",
    openResource: "View resource"
  }
} as const;

export default async function StackPage() {
  const [locale, skills, resources] = await Promise.all([getRequestLocale(), getSkills(), getResources()]);
  const t = stackCopy[locale];
  const featuredResources = resources.filter((resource) => resource.featured).slice(0, 6);
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <section className="section-container grid gap-5 py-12 md:grid-cols-3">
        {t.narratives.map(([title, description, Icon]) => {
          return (
            <article key={title} className="premium-glass-card rounded-md p-5">
              <Icon className="h-5 w-5 text-indigo-700" />
              <h2 className="mt-5 text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          );
        })}
      </section>

      <section className="section-container grid gap-8 py-12 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <SectionHeader
            eyebrow={t.skillEyebrow}
            title={t.skillTitle}
            description={t.skillDescription}
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
          eyebrow={t.resourceEyebrow}
          title={t.resourceTitle}
          description={t.resourceDescription}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredResources.map((resource) => (
            <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="premium-glass-card group block rounded-md p-5">
              <div className="flex items-center justify-between gap-4">
                <Badge>{resource.category}</Badge>
                <span className="text-xs font-bold text-indigo-700">{t.openResource}</span>
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
