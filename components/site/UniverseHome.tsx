import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Compass,
  Database,
  FileText,
  Library,
  Lightbulb,
  Palette,
  Rocket,
  Sparkles,
  Workflow,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionGradientHalo } from "@/components/effects/SectionGradientHalo";
import { BlogCard } from "@/components/site/BlogCard";
import { GuideCard } from "@/components/site/GuideExplorer";
import { Badge } from "@/components/ui/Badge";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ShimmerBadge } from "@/components/ui/ShimmerBadge";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  techStack: string[];
  featured: boolean;
  role: string;
  challenge: string;
  solution: string;
  result: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: Date | null;
  content: string;
  featured: boolean;
};

type Guide = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  difficulty: string;
  audience: string;
  readingTime: string;
  featured: boolean;
};

type Resource = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  reason: string;
  useCase: string;
  featured: boolean;
};

type Playbook = {
  id: string;
  title: string;
  slug: string;
  scenario: string;
  principles: string[];
  steps: string[];
  example: string;
  featured: boolean;
};

type NowItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
};

type ManifestoItem = {
  id: string;
  title: string;
  content: string;
};

type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  description: string;
};

type UniverseHomeProps = {
  locale: Locale;
  siteName: string;
  avatarUrl: string;
  projects: Project[];
  articles: Article[];
  guides: Guide[];
  resources: Resource[];
  playbooks: Playbook[];
  nowItems: NowItem[];
  manifestoItems: ManifestoItem[];
  skills: Skill[];
};

const homeCopy = {
  zh: {
    heroBadge: "Yaokai.me · Personal Brand OS · Creative Engineering",
    heroTitle: "把复杂想法，做成真正有质感的数字产品。",
    heroLead: "我把全栈工程、产品判断、视觉设计和 AI 工作流组合成一套创作系统，从想法、界面、数据、后台到部署，做出清晰、可用、可以长期生长的作品。",
    primaryCta: "进入内容系统",
    secondaryCta: "看精选项目",
    tertiaryCta: "了解方法论",
    focusSignals: ["全栈产品原型", "AI 原生工作流", "个人品牌系统", "明亮但克制的视觉"],
    stats: ["精选项目", "文章思考", "实践指南"],
    visualKicker: "PERSONAL BRAND OS",
    visualSubtitle: "Technology · Design · AI",
    visualPipeline: ["Research", "Shape", "Build", "Ship"],
    visualCards: ["Content System", "Product Thinking", "Full-stack Build"],
    continue: "继续探索",
    identityEyebrow: "Positioning",
    identityTitle: "这不是一张作品集，而是一套展示能力如何持续发生的系统。",
    identityBody: [
      "作品证明执行力，文章沉淀判断，指南复用经验，资源库连接工具，Now 记录正在发生的事。它们合在一起，才像一个真实的个人品牌产品。",
      "我想让访客快速理解三件事：我能把模糊需求拆清楚，我能把系统做出来，我也会在细节、文案和体验上持续打磨。"
    ],
    universeEyebrow: "Content Architecture",
    universeTitle: "每个入口都应该让人继续看下去。",
    universeDescription: "我把网站从单页展示改成内容系统：用户可以按作品、指南、文章、方法论、技术栈、资源和当前状态进入，不同内容之间互相支撑。",
    capabilityEyebrow: "Capability System",
    capabilityTitle: "高级感来自清晰的判断，不是来自更多装饰。",
    capabilityDescription: "真正有质感的网站，应该让用户更快理解价值、更愿意点击、更信任背后的执行能力。",
    guideEyebrow: "Guides",
    guideTitle: "把经验写成下一次可以复用的步骤。",
    guideDescription: "适合想看我如何拆问题、定边界、选技术、推进项目的人。",
    projectEyebrow: "Selected Work",
    projectTitle: "项目不只展示结果，也展示判断过程。",
    projectDescription: "我更在意案例能不能讲清背景、挑战、角色、方案和结果。",
    workflowEyebrow: "AI Workflow",
    workflowTitle: "AI 不是一个按钮，而是一层贯穿全流程的协作能力。",
    workflowDescription: "我让 AI 参与研究、拆解、实现、检查和复盘，但最终判断始终由真实目标、用户体验和工程质量负责。",
    articleEyebrow: "Writing",
    articleTitle: "近期文章与思考。",
    articleDescription: "把构建过程中的判断写下来，让经验不只停留在项目里。",
    playbookEyebrow: "Playbook",
    playbookTitle: "做事方式，需要被看见。",
    resourceEyebrow: "Library",
    resourceTitle: "工具箱也是创作系统的一部分。",
    resourceDescription: "我选择工具时，会看它是否能提升判断质量、降低维护成本、帮助作品长期生长。",
    nowEyebrow: "Now",
    nowTitle: "这个网站应该是活的。",
    nowDescription: "当前项目、正在研究的方向、下一步计划，会持续从这里更新。",
    manifestoEyebrow: "Manifesto",
    manifestoTitle: "我相信：好作品不是堆出来的，是被系统训练出来的。",
    manifestoCta: "阅读完整理念",
    finalEyebrow: "Contact",
    finalTitle: "如果一个想法值得认真打磨，我们可以从一次清晰沟通开始。",
    finalDescription: "适合聊产品原型、全栈实现、AI 工作流、个人品牌网站、内容系统和需要审美与执行力同时在线的数字体验。",
    finalPrimary: "开始沟通",
    finalSecondary: "继续探索",
    challenge: "挑战",
    result: "结果"
  },
  ja: {
    heroBadge: "Yaokai.me · Personal Brand OS · Creative Engineering",
    heroTitle: "複雑なアイデアを、美しく使えるデジタルプロダクトへ。",
    heroLead: "フルスタック開発、プロダクト判断、ビジュアルデザイン、AI ワークフローを一つの制作システムとして組み合わせ、構想から UI、データ、管理画面、デプロイまで形にします。",
    primaryCta: "コンテンツを見る",
    secondaryCta: "制作実績を見る",
    tertiaryCta: "方法論を見る",
    focusSignals: ["フルスタック試作", "AI ネイティブワークフロー", "個人ブランドシステム", "明るく精密な UI"],
    stats: ["制作実績", "記事", "実践ガイド"],
    visualKicker: "PERSONAL BRAND OS",
    visualSubtitle: "Technology · Design · AI",
    visualPipeline: ["Research", "Shape", "Build", "Ship"],
    visualCards: ["Content System", "Product Thinking", "Full-stack Build"],
    continue: "下へ進む",
    identityEyebrow: "Positioning",
    identityTitle: "これは単なるポートフォリオではなく、能力が継続的に生まれる仕組みです。",
    identityBody: [
      "制作実績は実行力を示し、記事は判断を残し、ガイドは経験を再利用可能にし、リソースは道具をつなぎ、Now は現在進行形の活動を伝えます。",
      "訪問者に伝えたいのは、曖昧な要望を整理できること、システムとして実装できること、細部の文章と体験まで磨けることです。"
    ],
    universeEyebrow: "Content Architecture",
    universeTitle: "どの入口から入っても、次に読みたくなる構造へ。",
    universeDescription: "単なる一枚の紹介ページではなく、制作実績、ガイド、記事、方法論、技術スタック、リソース、現在の活動をつなぐコンテンツシステムとして設計します。",
    capabilityEyebrow: "Capability System",
    capabilityTitle: "上質さは装飾の量ではなく、判断の明確さから生まれます。",
    capabilityDescription: "よいサイトは、価値を早く伝え、クリックしたくなり、背後の実行力を信頼できる状態をつくります。",
    guideEyebrow: "Guides",
    guideTitle: "経験を、次に使える手順へ。",
    guideDescription: "問題の分解、境界設定、技術選定、プロジェクト推進をどう行うかを整理しています。",
    projectEyebrow: "Selected Work",
    projectTitle: "成果だけでなく、判断の過程も見せる制作実績。",
    projectDescription: "背景、課題、役割、解決策、結果まで読めるケーススタディを重視します。",
    workflowEyebrow: "AI Workflow",
    workflowTitle: "AI はボタンではなく、制作全体を支える協働レイヤーです。",
    workflowDescription: "調査、構造化、実装、検証、振り返りに AI を使いながら、最終判断は目的、体験、品質に基づいて行います。",
    articleEyebrow: "Writing",
    articleTitle: "最近の記事と思考。",
    articleDescription: "制作中の判断を言葉にし、経験をプロジェクトの外でも使える形にします。",
    playbookEyebrow: "Playbook",
    playbookTitle: "仕事の進め方も、作品の一部です。",
    resourceEyebrow: "Library",
    resourceTitle: "道具箱も制作システムの一部。",
    resourceDescription: "判断の質を上げ、保守コストを下げ、作品を長く育てられる道具を選びます。",
    nowEyebrow: "Now",
    nowTitle: "このサイトは、更新され続ける場所です。",
    nowDescription: "現在のプロジェクト、研究テーマ、次の計画をここに残します。",
    manifestoEyebrow: "Manifesto",
    manifestoTitle: "よい作品は積み上げるだけでなく、仕組みによって磨かれます。",
    manifestoCta: "理念を読む",
    finalEyebrow: "Contact",
    finalTitle: "本気で磨く価値のあるアイデアなら、まずは一度整理して話しましょう。",
    finalDescription: "プロダクト試作、フルスタック実装、AI ワークフロー、個人ブランドサイト、コンテンツシステムなどについて相談できます。",
    finalPrimary: "相談する",
    finalSecondary: "さらに見る",
    challenge: "課題",
    result: "結果"
  },
  en: {
    heroBadge: "Yaokai.me · Personal Brand OS · Creative Engineering",
    heroTitle: "Turning complex ideas into polished digital products.",
    heroLead: "I combine full-stack engineering, product judgment, visual design, and AI workflows into one creation system: from idea and interface to data, admin tools, deployment, and long-term content.",
    primaryCta: "Enter the system",
    secondaryCta: "View selected work",
    tertiaryCta: "Read the playbook",
    focusSignals: ["Full-stack prototypes", "AI-native workflows", "Personal brand systems", "Bright, precise interfaces"],
    stats: ["Selected work", "Essays", "Practical guides"],
    visualKicker: "PERSONAL BRAND OS",
    visualSubtitle: "Technology · Design · AI",
    visualPipeline: ["Research", "Shape", "Build", "Ship"],
    visualCards: ["Content System", "Product Thinking", "Full-stack Build"],
    continue: "Keep exploring",
    identityEyebrow: "Positioning",
    identityTitle: "This is not just a portfolio. It is a system that shows how good work keeps happening.",
    identityBody: [
      "Projects prove execution. Writing captures judgment. Guides make experience reusable. The library connects tools. Now keeps the site alive.",
      "The goal is simple: help visitors understand that I can clarify vague ideas, build real systems, and polish the details that make a product feel trustworthy."
    ],
    universeEyebrow: "Content Architecture",
    universeTitle: "Every entry point should make people want to keep going.",
    universeDescription: "Instead of a single showcase page, the site is structured as a connected content system across work, guides, writing, playbooks, stack, library, and current focus.",
    capabilityEyebrow: "Capability System",
    capabilityTitle: "A premium feeling comes from clear judgment, not more decoration.",
    capabilityDescription: "A better site helps people understand the value faster, click with intent, and trust the execution behind the interface.",
    guideEyebrow: "Guides",
    guideTitle: "Turning experience into steps I can reuse.",
    guideDescription: "For people who want to see how I frame problems, draw boundaries, choose tools, and ship real systems.",
    projectEyebrow: "Selected Work",
    projectTitle: "Work should show the decisions behind the result.",
    projectDescription: "I care about case studies that explain context, challenge, role, solution, and outcome.",
    workflowEyebrow: "AI Workflow",
    workflowTitle: "AI is not a button. It is a collaboration layer across the whole process.",
    workflowDescription: "I use AI for research, framing, implementation, review, and reflection, while keeping the final judgment anchored in goals, UX, and engineering quality.",
    articleEyebrow: "Writing",
    articleTitle: "Recent writing and thinking.",
    articleDescription: "I write down the decisions behind the work so experience can travel beyond a single project.",
    playbookEyebrow: "Playbook",
    playbookTitle: "The way I work should be visible too.",
    resourceEyebrow: "Library",
    resourceTitle: "The toolkit is part of the creation system.",
    resourceDescription: "I choose tools by whether they improve judgment, reduce maintenance cost, and help work compound over time.",
    nowEyebrow: "Now",
    nowTitle: "The site should feel alive.",
    nowDescription: "Current work, research directions, and next plans live here.",
    manifestoEyebrow: "Manifesto",
    manifestoTitle: "Good work is not piled up. It is trained by a system.",
    manifestoCta: "Read the manifesto",
    finalEyebrow: "Contact",
    finalTitle: "If an idea is worth polishing, we can start with a clear conversation.",
    finalDescription: "Useful for product prototypes, full-stack builds, AI workflows, personal brand sites, content systems, and digital experiences that need both taste and execution.",
    finalPrimary: "Start a conversation",
    finalSecondary: "Keep exploring",
    challenge: "Challenge",
    result: "Result"
  }
} as const;

const universeLinks = [
  { title: "Guide", href: "/guide", icon: BookOpen, color: "from-cyan-100 to-blue-50" },
  { title: "Projects", href: "/projects", icon: Blocks, color: "from-violet-100 to-fuchsia-50" },
  { title: "Blog", href: "/blog", icon: FileText, color: "from-rose-100 to-orange-50" },
  { title: "Playbook", href: "/playbook", icon: Workflow, color: "from-emerald-100 to-cyan-50" },
  { title: "Stack", href: "/stack", icon: Database, color: "from-sky-100 to-indigo-50" },
  { title: "Library", href: "/library", icon: Library, color: "from-amber-100 to-pink-50" },
  { title: "Now", href: "/now", icon: Compass, color: "from-lime-100 to-cyan-50" },
  { title: "Manifesto", href: "/manifesto", icon: Lightbulb, color: "from-purple-100 to-rose-50" }
];

const linkLabels: Record<Locale, string[]> = {
  zh: ["指南库", "作品", "文章", "方法论", "技术栈", "资源库", "当前状态", "个人理念"],
  ja: ["ガイド", "制作実績", "記事", "方法論", "技術スタック", "リソース", "現在", "理念"],
  en: ["Guides", "Work", "Writing", "Playbook", "Stack", "Library", "Now", "Manifesto"]
};

const linkDescriptions: Record<Locale, string[]> = {
  zh: ["可复用的实践清单。", "看问题、角色、方案和结果。", "记录构建过程里的判断。", "产品、工程、AI 协作框架。", "能力地图和工具雷达。", "反复验证过的资源。", "正在推进的事情。", "长期创造原则。"],
  ja: ["再利用できる実践手順。", "課題、役割、解決策、結果。", "制作中の判断を残す。", "プロダクト、開発、AI 協働。", "スキルとツールの地図。", "実戦で使う資料。", "現在進行形の活動。", "長く作るための原則。"],
  en: ["Reusable practical guides.", "Context, role, solution, outcome.", "Judgment behind the work.", "Product, engineering, and AI frameworks.", "A skill map and tool radar.", "Resources tested in real work.", "What is active right now.", "Principles for long-term craft."]
};

const capabilityMatrix = [
  { key: "Full-stack", icon: Code2 },
  { key: "AI Workflow", icon: BrainCircuit },
  { key: "Product", icon: Compass },
  { key: "Design", icon: Palette },
  { key: "Automation", icon: Zap },
  { key: "Content", icon: FileText },
  { key: "Deployment", icon: Rocket },
  { key: "Delivery", icon: CheckCircle2 }
];

const capabilityText: Record<Locale, Array<[string, string]>> = {
  zh: [
    ["全栈实现", "把前台、后台、数据模型、接口和部署接成真正能运行的系统。"],
    ["AI 工作流", "让 AI 加速研究、拆解、实现和检查，但不替代最终判断。"],
    ["产品判断", "从用户目标、成功信号和维护成本出发，判断什么值得先做。"],
    ["视觉体验", "关注信息层级、动效节奏、按钮反馈、阅读体验和移动端细节。"],
    ["自动化", "把重复任务变成可监控、可恢复、可复用的工作流。"],
    ["内容系统", "让项目、文章、指南、资源和方法论互相连接，持续沉淀证据。"],
    ["部署能力", "从本地构建、迁移、PM2、Nginx 到 Smoke Test，保证上线可验证。"],
    ["交付意识", "拆问题、定边界、做验证，把模糊需求推进到可交付结果。"]
  ],
  ja: [
    ["フルスタック実装", "UI、管理画面、データモデル、API、デプロイまで一つのシステムとして作ります。"],
    ["AI ワークフロー", "調査、分解、実装、検証を速くしながら、最終判断は人が持ちます。"],
    ["プロダクト判断", "ユーザー目標、成功指標、保守コストから優先順位を決めます。"],
    ["ビジュアル体験", "情報設計、動き、ボタンの反応、読みやすさ、モバイル体験を磨きます。"],
    ["自動化", "繰り返し作業を、監視・復旧・再利用できる流れに変えます。"],
    ["コンテンツ設計", "実績、記事、ガイド、資料、方法論をつなげて信頼を積み上げます。"],
    ["デプロイ", "ビルド、マイグレーション、PM2、Nginx、Smoke Test まで確認します。"],
    ["納品意識", "曖昧な要望を分解し、境界を決め、検証可能な形で前に進めます。"]
  ],
  en: [
    ["Full-stack build", "Connecting UI, admin tools, data models, APIs, and deployment into a real system."],
    ["AI workflow", "Using AI for speed in research, framing, implementation, and review without outsourcing judgment."],
    ["Product judgment", "Prioritizing from user goals, success signals, and maintenance cost."],
    ["Visual experience", "Polishing hierarchy, motion, feedback, reading flow, and mobile details."],
    ["Automation", "Turning repeated work into workflows that can be monitored, recovered, and reused."],
    ["Content system", "Connecting work, writing, guides, resources, and principles into a durable proof system."],
    ["Deployment", "Verifying builds, migrations, PM2, Nginx, and smoke tests before calling something shipped."],
    ["Delivery mindset", "Clarifying vague needs, setting boundaries, and moving toward verifiable outcomes."]
  ]
};

const workflowText: Record<Locale, Array<[string, string]>> = {
  zh: [["Research", "展开用户场景、风险、竞品和约束。"], ["Shape", "压成信息架构、优先级和体验路线。"], ["Build", "把界面、数据、接口和后台接成系统。"], ["Polish", "检查视觉节奏、状态、移动端和文案。"], ["Ship", "构建、部署、验证，让作品真的上线。"]],
  ja: [["Research", "ユーザー、リスク、競合、制約を整理。"], ["Shape", "情報構造、優先順位、体験ルートへ圧縮。"], ["Build", "UI、データ、API、管理画面を接続。"], ["Polish", "見た目、状態、モバイル、文章を確認。"], ["Ship", "ビルド、デプロイ、検証まで行う。"]],
  en: [["Research", "Map users, risks, references, and constraints."], ["Shape", "Turn ambiguity into structure and priorities."], ["Build", "Connect interface, data, APIs, and admin tools."], ["Polish", "Review rhythm, states, mobile, and copy."], ["Ship", "Build, deploy, verify, and learn."]]
};

export function UniverseHome({
  locale,
  siteName,
  avatarUrl,
  projects,
  articles,
  guides,
  resources,
  playbooks,
  nowItems,
  manifestoItems,
  skills
}: UniverseHomeProps) {
  const copy = homeCopy[locale];
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 4);
  const featuredGuides = guides.filter((guide) => guide.featured).slice(0, 4);
  const latestArticles = articles.slice(0, 4);
  const featuredResources = resources.filter((resource) => resource.featured).slice(0, 6);
  const featuredPlaybooks = playbooks.filter((playbook) => playbook.featured).slice(0, 3);
  const topSkills = skills.slice(0, 5);

  return (
    <div className="relative overflow-hidden pb-20">
      <HeroSection
        copy={copy}
        siteName={siteName}
        avatarUrl={avatarUrl}
        projectCount={projects.length}
        articleCount={articles.length}
        guideCount={guides.length}
      />

      <section className="section-container relative py-16 md:py-20">
        <SectionGradientHalo />
        <ScrollReveal className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <ShimmerBadge>{copy.identityEyebrow}</ShimmerBadge>
            <h2 className="mt-5 max-w-3xl text-balance text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              {copy.identityTitle}
            </h2>
          </div>
          <div className="grid gap-4 text-base leading-8 text-slate-600 md:text-lg">
            {copy.identityBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="wide-container relative py-16 md:py-20">
        <SectionIntro eyebrow={copy.universeEyebrow as string} title={copy.universeTitle as string} description={copy.universeDescription as string} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {universeLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.href} delay={index * 0.035}>
                <Link href={item.href} className="premium-glass-card group block h-full rounded-md p-5">
                  <div className={cn("grid h-12 w-12 place-items-center rounded-md bg-gradient-to-br text-slate-900 shadow-sm", item.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">{item.title}</p>
                      <h3 className="mt-1 text-2xl font-black text-slate-950">{linkLabels[locale][index]}</h3>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-700" />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{linkDescriptions[locale][index]}</p>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="section-container relative py-16 md:py-20">
        <SectionIntro eyebrow={copy.capabilityEyebrow as string} title={copy.capabilityTitle as string} description={copy.capabilityDescription as string} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {capabilityMatrix.map((item, index) => {
            const Icon = item.icon;
            const [title, detail] = capabilityText[locale][index];
            return (
              <ScrollReveal key={item.key} delay={index * 0.035}>
                <article className="gradient-border-card h-full rounded-md p-5">
                  <Icon className="h-5 w-5 text-cyan-700" />
                  <h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{detail}</p>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="section-container relative grid gap-12 py-16 md:py-20 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <SectionIntro eyebrow={copy.guideEyebrow as string} title={copy.guideTitle as string} description={copy.guideDescription as string} />
          <div className="grid gap-4">
            {featuredGuides.slice(0, 3).map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
        <div>
          <SectionIntro eyebrow={copy.projectEyebrow as string} title={copy.projectTitle as string} description={copy.projectDescription as string} />
          <div className="grid gap-4">
            {featuredProjects.slice(0, 2).map((project) => (
              <ProjectFeature key={project.id} project={project} copy={copy} />
            ))}
          </div>
        </div>
      </section>

      <section className="wide-container relative py-16 md:py-20">
        <SectionGradientHalo className="opacity-80" />
        <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-center">
          <SectionIntro eyebrow={copy.workflowEyebrow as string} title={copy.workflowTitle as string} description={copy.workflowDescription as string} />
          <div className="premium-glass-card rounded-md p-5 md:p-6">
            <div className="grid gap-3 md:grid-cols-5">
              {workflowText[locale].map(([title, detail], index) => (
                <div key={title} className="relative rounded-md border border-white/70 bg-white/60 p-4">
                  <h3 className="text-lg font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-600">{detail}</p>
                  {index < workflowText[locale].length - 1 ? <span className="absolute -right-2 top-1/2 hidden h-px w-4 bg-gradient-to-r from-cyan-300 to-violet-300 md:block" /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-container grid gap-12 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionIntro eyebrow={copy.articleEyebrow as string} title={copy.articleTitle as string} description={copy.articleDescription as string} />
          <div className="grid gap-4 md:grid-cols-2">
            {latestArticles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        </div>
        <aside className="grid content-start gap-4">
          <SectionIntro eyebrow={copy.playbookEyebrow as string} title={copy.playbookTitle as string} />
          {featuredPlaybooks.map((playbook) => (
            <Link key={playbook.id} href="/playbook" className="premium-glass-card group block rounded-md p-5">
              <h3 className="text-xl font-black text-slate-950">{playbook.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{playbook.scenario}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {playbook.principles.slice(0, 3).map((principle) => (
                  <Badge key={principle}>{principle}</Badge>
                ))}
              </div>
            </Link>
          ))}
        </aside>
      </section>

      <section className="wide-container relative py-16 md:py-20">
        <SectionIntro eyebrow={copy.resourceEyebrow as string} title={copy.resourceTitle as string} description={copy.resourceDescription as string} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredResources.map((resource) => (
            <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="premium-glass-card group block rounded-md p-5">
              <div className="flex items-center justify-between gap-4">
                <Badge>{resource.category}</Badge>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-700" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{resource.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{resource.useCase}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="section-container relative grid gap-12 py-16 md:py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionIntro eyebrow={copy.nowEyebrow as string} title={copy.nowTitle as string} description={copy.nowDescription as string} />
          <div className="mt-8 grid gap-3">
            {topSkills.map((skill) => (
              <div key={skill.id} className="rounded-md border border-white/70 bg-white/60 p-3 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-950">{skill.name}</span>
                  <span className="text-xs font-bold text-cyan-700">{skill.level}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-md bg-slate-200/60">
                  <div className="h-full rounded-md bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300" style={{ width: `${skill.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {nowItems.slice(0, 6).map((item) => (
            <article key={item.id} className="premium-glass-card rounded-md p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge>{item.type}</Badge>
                <span className="text-xs font-bold text-cyan-700">{item.status}</span>
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-container relative py-16 md:py-20">
        <div className="liquid-panel rounded-md border border-white/70 bg-white/72 p-6 shadow-[0_32px_110px_rgba(71,85,105,0.14)] backdrop-blur-2xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <ShimmerBadge>{copy.manifestoEyebrow}</ShimmerBadge>
              <h2 className="mt-5 text-balance text-4xl font-black leading-tight text-slate-950 md:text-6xl">
                {copy.manifestoTitle}
              </h2>
              <Link href="/manifesto" className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/75 bg-white/70 px-5 py-3 text-sm font-bold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white">
                {copy.manifestoCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {manifestoItems.slice(0, 4).map((item, index) => (
                <article key={item.id} className="rounded-md border border-white/70 bg-white/64 p-5 shadow-sm backdrop-blur">
                  <span className="text-xs font-black text-cyan-700">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-xl font-black text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.content}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-16 md:py-20">
        <div className="relative overflow-hidden rounded-md border border-white/70 bg-white/74 p-6 shadow-[0_34px_120px_rgba(71,85,105,0.16)] backdrop-blur-2xl md:p-10">
          <SectionGradientHalo className="opacity-70" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <ShimmerBadge>{copy.finalEyebrow}</ShimmerBadge>
              <h2 className="mt-5 max-w-3xl text-balance text-4xl font-black leading-tight text-slate-950 md:text-6xl">
                {copy.finalTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                {copy.finalDescription}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <MagneticButton href="/contact">{copy.finalPrimary} <ArrowRight className="h-4 w-4" /></MagneticButton>
              <MagneticButton href="/explore" variant="secondary">{copy.finalSecondary} <Compass className="h-4 w-4" /></MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroSection({
  copy,
  siteName,
  avatarUrl,
  projectCount,
  articleCount,
  guideCount
}: {
  copy: (typeof homeCopy)[Locale];
  siteName: string;
  avatarUrl: string;
  projectCount: number;
  articleCount: number;
  guideCount: number;
}) {
  return (
    <section className="wide-container relative grid min-h-[min(880px,100svh)] items-center gap-10 pb-10 pt-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.86fr)]">
      <div className="relative z-10 max-w-4xl">
        <ShimmerBadge className="mb-5">{copy.heroBadge}</ShimmerBadge>
        <h1 className="fluid-title text-balance text-[clamp(2.75rem,5.1vw,5.55rem)] font-black leading-[1.02]">
          {copy.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl md:leading-9">
          {copy.heroLead}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <MagneticButton href="/explore">{copy.primaryCta} <ArrowRight className="h-4 w-4" /></MagneticButton>
          <MagneticButton href="/projects" variant="secondary">{copy.secondaryCta} <ArrowUpRight className="h-4 w-4" /></MagneticButton>
          <MagneticButton href="/playbook" variant="ghost">{copy.tertiaryCta} <Workflow className="h-4 w-4" /></MagneticButton>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {copy.focusSignals.map((item) => (
            <span key={item} className="rounded-md border border-white/70 bg-white/66 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">
              {item}
            </span>
          ))}
        </div>

        <div className="mt-6 grid max-w-xl grid-cols-3 gap-2.5">
          {[
            [projectCount, copy.stats[0]],
            [articleCount, copy.stats[1]],
            [guideCount, copy.stats[2]]
          ].map(([value, label]) => (
            <div key={label} className="premium-glass-card rounded-md p-3">
              <p className="text-2xl font-black text-slate-950 md:text-3xl">{value}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-[480px] lg:min-h-[540px]">
        <HeroVisual copy={copy} siteName={siteName} avatarUrl={avatarUrl} />
      </div>

      <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 grid-cols-[auto_auto] items-center gap-3 text-xs font-bold text-slate-500 md:grid">
        <span className="h-12 w-px origin-bottom rounded-full bg-gradient-to-b from-cyan-300 via-violet-300 to-transparent [animation:breathe_2.2s_ease-in-out_infinite]" />
        <span>{copy.continue}</span>
      </div>
    </section>
  );
}

function HeroVisual({ copy, siteName, avatarUrl }: { copy: (typeof homeCopy)[Locale]; siteName: string; avatarUrl: string }) {
  return (
    <div className="relative mx-auto h-[500px] max-w-[640px] lg:h-[540px]">
      <div className="absolute inset-0 rounded-md border border-white/70 bg-white/34 shadow-[0_38px_130px_rgba(71,85,105,0.14)] backdrop-blur-2xl" />
      <div className="absolute inset-5 rounded-md border border-white/72 bg-white/46" />
      <div className="absolute left-1/2 top-[46%] grid h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md border border-white/78 bg-white/78 shadow-[0_28px_86px_rgba(14,165,233,0.14)] backdrop-blur-2xl">
        <div className="relative h-24 w-24 overflow-hidden rounded-md border border-white/78 bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 shadow-inner">
          <Image src={avatarUrl} alt={siteName} fill className="object-cover p-4" sizes="112px" />
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs font-black uppercase text-cyan-700">{copy.visualKicker}</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">{siteName}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{copy.visualSubtitle}</p>
        </div>
      </div>

      <div className="absolute left-[6%] top-[12%] w-56 rounded-md border border-white/72 bg-white/72 p-4 shadow-[0_22px_76px_rgba(14,165,233,0.12)] backdrop-blur-xl">
        <p className="text-xs font-black text-cyan-700">System Map</p>
        <div className="mt-4 grid gap-2">
          {copy.visualCards.map((item) => (
            <span key={item} className="rounded-md bg-white/76 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">{item}</span>
          ))}
        </div>
      </div>

      <div className="absolute right-[5%] top-[18%] w-52 rounded-md border border-white/72 bg-white/72 p-4 shadow-[0_22px_76px_rgba(168,85,247,0.12)] backdrop-blur-xl">
        <p className="text-xs font-black text-violet-700">Workflow</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {copy.visualPipeline.map((item) => (
            <span key={item} className="rounded-md bg-white/76 px-2.5 py-2 text-center text-xs font-bold text-slate-700 shadow-sm">{item}</span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[12%] left-[8%] right-[8%] rounded-md border border-white/72 bg-white/76 p-4 shadow-[0_26px_82px_rgba(71,85,105,0.13)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-rose-700">Content System</p>
            <p className="mt-1 text-sm font-bold text-slate-950">Projects · Writing · Guides · Playbook</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-md bg-gradient-to-br from-cyan-100 via-white to-fuchsia-100 text-cyan-800">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-md bg-slate-200/60">
          <div className="h-full w-[76%] rounded-md bg-gradient-to-r from-cyan-300 via-violet-300 to-rose-300" />
        </div>
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-9 max-w-3xl">
      <ShimmerBadge className="mb-4">{eyebrow}</ShimmerBadge>
      <h2 className="text-balance text-3xl font-black leading-tight text-slate-950 md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">{description}</p> : null}
    </div>
  );
}

function ProjectFeature({ project, copy }: { project: Project; copy: (typeof homeCopy)[Locale] }) {
  return (
    <Link href={`/projects/${project.slug}`} className="premium-glass-card group grid gap-5 rounded-md p-5 md:grid-cols-[180px_1fr]">
      <div className="relative min-h-44 overflow-hidden rounded-md border border-white/72 bg-cyan-50">
        {project.coverImage ? <Image src={project.coverImage} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="180px" /> : null}
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <Badge>{project.category}</Badge>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-700" />
        </div>
        <h3 className="mt-5 text-2xl font-black text-slate-950">{project.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{project.excerpt}</p>
        <div className="mt-4 grid gap-2 text-xs leading-5 text-slate-500">
          <p><span className="font-bold text-slate-700">{copy.challenge}：</span>{project.challenge}</p>
          <p><span className="font-bold text-slate-700">{copy.result}：</span>{project.result}</p>
        </div>
      </div>
    </Link>
  );
}
