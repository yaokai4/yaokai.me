import { Layers3, Radar, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { SkillRadar } from "@/components/site/SkillRadar";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { getResources, getSkills } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const t = applyCopyOverrides(stackCopy[locale], copyOverrides, `stack.${locale}`);

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
    metaDescription: "姚凯的技术栈：前端体验、系统工程、移动端、AI 工作流、设计判断、部署与自动化如何服务真实产品。",
    eyebrow: "技术栈",
    title: "技术对我来说，不是 Logo 墙，而是判断和交付的工具。",
    description: "这里展示我如何组合前端、后端、数据库、移动端、部署、设计工具、AI 工具和自动化，让一个想法慢慢变成可上线、可维护、能继续生长的产品系统。",
    narratives: [
      ["前端体验", "我关心的不只是页面能不能运行，而是信息层级、交互反馈、动效节奏和移动端阅读是否一起服务用户。", Sparkles],
      ["系统工程", "从数据库模型、API 契约、后台管理、权限边界到部署脚本，我希望项目在上线之后仍然容易理解和维护。", Layers3],
      ["AI 工作流", "我把 AI 当作调研、设计、开发和内容整理的协作层，但最终仍由真实体验和工程质量来验收。", Radar]
    ],
    skillEyebrow: "技能地图",
    skillTitle: "按能力组织，而不是堆技术名词。",
    skillDescription: "每项技术都要回答三个问题：我用它解决什么、为什么选择它、它如何帮助真实项目继续前进。",
    resourceEyebrow: "相关资源",
    resourceTitle: "这些工具和文档，是我长期放在手边的工作台。",
    resourceDescription: "技术栈不是静态清单，它会随着项目复杂度、产品目标、协作方式和审美判断一起变化。",
    openResource: "查看资源"
  },
  ja: {
    metaTitle: "技術スタック - 姚凱",
    metaDescription: "フロントエンド、システム設計、モバイル、AI ワークフロー、デザイン判断、デプロイ、自動化を整理。",
    eyebrow: "技術スタック",
    title: "技術はロゴの一覧ではなく、判断して届けるための道具です。",
    description: "フロントエンド、バックエンド、データベース、モバイル、デプロイ、デザインツール、AI ツール、自動化をどう組み合わせているかを整理しています。目的は、アイデアを公開でき、運用でき、後から育てられる形にすることです。",
    narratives: [
      ["フロント体験", "動くだけでなく、情報の見せ方、反応、動き、モバイルでの読みやすさが目的に合っているかを見ます。", Sparkles],
      ["システム設計", "データモデル、API、管理画面、権限、デプロイまで、公開後も理解しやすく保守しやすい構造を重視します。", Layers3],
      ["AI ワークフロー", "AI を調査、設計、開発、内容整理の協業層として使います。ただし最終的な品質は、体験と実装で確認します。", Radar]
    ],
    skillEyebrow: "スキルマップ",
    skillTitle: "技術名ではなく、できることの単位で整理します。",
    skillDescription: "それぞれの技術について、何を解くために使うのか、なぜ選ぶのか、実際のプロジェクトにどう効くのかを見ます。",
    resourceEyebrow: "関連リソース",
    resourceTitle: "長く手元に置く道具と資料が、作業台をつくります。",
    resourceDescription: "技術スタックは固定リストではありません。プロジェクトの複雑さ、目的、協業のしかた、見せ方の判断に合わせて変わっていきます。",
    openResource: "リソースを見る"
  },
  en: {
    metaTitle: "Stack - Yaokai",
    metaDescription: "Yaokai's stack across front-end experience, systems engineering, mobile, AI workflows, design judgment, deployment, and automation.",
    eyebrow: "Stack",
    title: "Technology is not a logo wall. It is how I make decisions and ship.",
    description: "How I combine front end, back end, databases, mobile clients, deployment, design tools, AI tools, and automation to move an idea toward something shippable, maintainable, and still able to grow.",
    narratives: [
      ["Front-end experience", "I care whether hierarchy, feedback, motion, mobile reading, and accessibility serve the user, not only whether the page runs.", Sparkles],
      ["Systems engineering", "From data models and API contracts to admin tools, permissions, and deployment scripts, I build so the project is still understandable after launch.", Layers3],
      ["AI workflow", "I use AI as a collaboration layer for research, design, development, and content, then validate the result through real experience and engineering checks.", Radar]
    ],
    skillEyebrow: "Skill Map",
    skillTitle: "Organized by capability, not by technology names.",
    skillDescription: "Each tool should answer what problem it helps me solve, why I choose it, and how it supports real projects.",
    resourceEyebrow: "Related Resources",
    resourceTitle: "These tools and docs form the workbench I keep returning to.",
    resourceDescription: "A stack is not a static list. It changes with project complexity, product goals, collaboration style, and visual judgment.",
    openResource: "View resource"
  }
} as const;

export default async function StackPage() {
  const [locale, skills, resources, copyOverrides] = await Promise.all([getRequestLocale(), getSkills(), getResources(), getCopyOverrides()]);
  const t = applyCopyOverrides(stackCopy[locale], copyOverrides, `stack.${locale}`);
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
