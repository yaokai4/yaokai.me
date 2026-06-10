"use client";

import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, Code2, Compass, Mail, PenLine, Rocket, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { withLocalePath, type Locale } from "@/lib/i18n";

type Project = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  techStack: string[];
  featured: boolean;
  role?: string;
  challenge?: string;
  result?: string;
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

type NowItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  progress: number;
};

type UniverseHomeProps = {
  locale: Locale;
  siteName: string;
  avatarUrl: string;
  projects: Project[];
  articles: Article[];
  guides: Guide[];
  nowItems: NowItem[];
};

const copy = {
  zh: {
    heroBadge: "Web 产品系统 / 全栈工程 / AI 协作",
    heroTitle: "姚凯 / Yaokai",
    heroSubtitle: "Full-stack Web Developer · Product-minded Builder",
    heroLead: "我在日本做 IT 与 Web / 全栈开发，擅长把需求、信息架构、界面、数据、后台和部署连成可上线、可运营、可复盘的产品系统。视觉要有记忆点，工程要稳，内容要能长期积累信任。",
    tags: ["Product Systems", "Full-stack", "Premium UI", "AI Workflow", "Ship & Iterate"],
    workCta: "查看作品",
    contactCta: "联系我",
    proofLabel: "Focus",
    proofTitle: "高级感不是装饰，而是清晰、可信、可继续生长。",
    proofLead: "我关心一个项目能否被快速理解、被稳定使用、被持续维护，并在上线后继续产生内容、数据和复盘。",
    proofItems: ["清晰的信息架构与用户路径", "前台体验、后台管理与数据模型", "部署、验收、内容维护与持续迭代"],
    workflowLabel: "Workflow",
    workflowLine: "Research / Shape / Build / Polish / Ship",
    selectedWork: "Selected Projects",
    selectedWorkTitle: "先看能证明判断、执行和交付质量的项目。",
    selectedWorkLead: "每个案例都不只展示截图，而是补充背景、问题、角色、技术栈、结果和复盘，让真实能力有证据可看。",
    projectProblem: "问题",
    projectRole: "角色",
    projectStack: "技术栈",
    projectResult: "结果",
    projectDefaultRole: "独立负责产品拆解、界面、后端、数据与部署",
    projectDefaultResult: "形成可上线、可维护、可继续扩展的产品系统",
    projectDefaultStack: "Next.js / TypeScript / Prisma",
    viewDetail: "查看案例",
    capability: "Capability System",
    capabilityTitle: "我把高级 Web 项目拆成五个必须稳定的层。",
    capabilityLead: "一个真正精致的网站，需要视觉、结构、工程、内容和迭代机制同时成立。任何一层薄弱，都会影响可信度。",
    capabilityItems: [
      ["全栈落地", "把页面、API、数据库、后台、权限和部署串起来，让项目不是展示稿，而是真正可运行的系统。"],
      ["产品结构", "梳理用户路径、信息层级、内容模型和维护成本，让网站能长期更新而不是上线即停止。"],
      ["界面质感", "打磨排版、留白、状态、动效、移动端和阅读节奏，让页面安静但有记忆点。"],
      ["内容表达", "把抽象能力写成具体案例、判断、结果和方法论，让访问者能快速建立信任。"],
      ["AI 协作", "把 AI 放进研究、拆解、实现、检查和复盘流程，用证据验收，而不是只追求生成速度。"]
    ],
    writing: "Writing / Guides",
    writingTitle: "把项目背后的判断，沉淀成可复用资产。",
    writingLead: "文章和指南记录工程、设计、AI 工作流和产品取舍，让经验不只停在截图，而能转化成下一次更快更稳的行动。",
    readArticle: "阅读全文",
    featuredLabel: "精选",
    guideTitle: "指南库",
    guideLead: "面向 AI 协作、全栈开发、产品判断和界面打磨的可执行指南。",
    guideCountLabel: "篇指南",
    guideAction: "进入指南",
    now: "Now",
    nowTitle: "当前投入，保持公开更新。",
    nowLead: "Now 区域记录正在推进的项目、研究方向和下一步计划，让这个网站不是静态作品集，而是持续演进的工作台。",
    nowFallback: [
      ["项目整理", "继续补齐 Machi、个人网站和内容系统的案例拆解。", "进行中", "Build", 72],
      ["AI 工作流", "沉淀从需求拆解到代码检查的协作流程。", "持续优化", "Research", 64],
      ["视觉系统", "把亮色背景、卡片、排版和移动端体验调得更稳定。", "打磨中", "Design", 58]
    ],
    finalTitle: "如果一个想法值得认真打磨，我们可以把它推进到可上线、可维护、可复盘。",
    finalLead: "适合个人品牌网站、作品集、内容系统、全栈产品原型、AI 辅助开发流程，以及需要从需求整理一路推进到部署上线的 Web 项目。"
  },
  ja: {
    heroBadge: "Personal Site / Web Product / AI Workflow",
    heroTitle: "姚凯 / Yaokai",
    heroSubtitle: "Full-stack Web Developer · Product-minded Builder",
    heroLead: "要件、情報設計、UI、データ、管理画面、デプロイをつなぎ、公開後も運用・改善できる Web プロダクトとして形にします。",
    tags: ["Product Systems", "Full-stack", "Premium UI", "AI Workflow", "Ship & Iterate"],
    workCta: "制作実績を見る",
    contactCta: "連絡する",
    proofLabel: "Focus",
    proofTitle: "上質さは装飾ではなく、明快さ、信頼性、成長できる構造です。",
    proofLead: "短時間で理解でき、安定して使え、公開後も内容と機能を育てられる形を重視します。",
    proofItems: ["明快な情報設計と導線", "UI・管理画面・データモデル", "公開、検証、運用、改善"],
    workflowLabel: "Workflow",
    workflowLine: "Research / Shape / Build / Polish / Ship",
    selectedWork: "Selected Projects",
    selectedWorkTitle: "判断、実装、納品品質が伝わるプロジェクトから。",
    selectedWorkLead: "スクリーンショットだけでなく、背景、課題、担当範囲、技術、結果、振り返りまで整理しています。",
    projectProblem: "課題",
    projectRole: "役割",
    projectStack: "技術",
    projectResult: "結果",
    projectDefaultRole: "要件整理、UI、バックエンド、データ、デプロイを担当",
    projectDefaultResult: "公開でき、保守しやすく、拡張できるプロダクトに整理",
    projectDefaultStack: "Next.js / TypeScript / Prisma",
    viewDetail: "詳細を見る",
    capability: "Capability System",
    capabilityTitle: "上質な Web プロジェクトを 5 つの層で支えます。",
    capabilityLead: "見た目、構造、実装、内容、改善の仕組みまで揃って初めて、長く信頼される体験になります。",
    capabilityItems: [
      ["フルスタック実装", "ページ、API、データベース、管理画面、権限、デプロイを一つの流れにします。"],
      ["プロダクト構造", "ユーザー導線、情報設計、内容モデル、運用コストを整理します。"],
      ["UI の質感", "レイアウト、余白、状態、動き、モバイル、読みやすさを丁寧に整えます。"],
      ["文章と整理", "抽象的な強みを、具体的なケース、判断、結果、方法論に変換します。"],
      ["AI 協作", "調査、分解、実装、検証、振り返りに AI を使い、証拠で品質を確認します。"]
    ],
    writing: "Writing / Guides",
    writingTitle: "プロジェクトの判断を、再利用できる資産にします。",
    writingLead: "エンジニアリング、デザイン、AI ワークフロー、プロダクト判断を記録し、次の行動に使える形で残します。",
    readArticle: "続きを読む",
    featuredLabel: "Featured",
    guideTitle: "ガイド",
    guideLead: "AI 協作、フルスタック開発、プロダクト判断、UI 改善のための実践ガイド。",
    guideCountLabel: "本のガイド",
    guideAction: "ガイドを見る",
    now: "Now",
    nowTitle: "いまの投入を公開しておく。",
    nowLead: "現在のプロジェクト、研究テーマ、次の改善を残し、このサイトを静的な作品集ではなく、更新され続ける作業台にします。",
    nowFallback: [
      ["プロジェクト整理", "Machi、個人サイト、コンテンツシステムのケースを整理中。", "進行中", "Build", 72],
      ["AI ワークフロー", "要件整理からコード確認までの協作手順を改善中。", "改善中", "Research", 64],
      ["ビジュアルシステム", "明るい背景、カード、余白、モバイル体験を調整中。", "調整中", "Design", 58]
    ],
    finalTitle: "真剣に磨く価値のあるアイデアなら、公開・運用・改善できる形まで進められます。",
    finalLead: "個人ブランドサイト、ポートフォリオ、コンテンツシステム、フルスタック試作、AI 開発ワークフロー、公開まで進めたい Web プロジェクトに向いています。"
  },
  en: {
    heroBadge: "Web Product Systems / Full-stack / AI Workflow",
    heroTitle: "Yaokai",
    heroSubtitle: "Full-stack Web Developer · Product-minded Builder",
    heroLead: "I connect requirements, information architecture, interface design, data, admin tooling, and deployment into Web product systems that can ship, operate, and keep improving.",
    tags: ["Product Systems", "Full-stack", "Premium UI", "AI Workflow", "Ship & Iterate"],
    workCta: "View work",
    contactCta: "Contact me",
    proofLabel: "Focus",
    proofTitle: "Premium is not decoration. It is clarity, trust, and a structure that can keep growing.",
    proofLead: "I care whether a project is easy to understand, stable to use, maintainable after launch, and able to keep accumulating content, data, and learning.",
    proofItems: ["Clear information architecture and user paths", "Front end, admin tools, and data models", "Deployment, validation, content operations, and iteration"],
    workflowLabel: "Workflow",
    workflowLine: "Research / Shape / Build / Polish / Ship",
    selectedWork: "Selected Projects",
    selectedWorkTitle: "Start with projects that show judgment, execution, and delivery quality.",
    selectedWorkLead: "Each case goes beyond screenshots and surfaces context, problem, role, stack, outcome, and lessons.",
    projectProblem: "Problem",
    projectRole: "Role",
    projectStack: "Stack",
    projectResult: "Outcome",
    projectDefaultRole: "Led product framing, interface, backend, data, and deployment",
    projectDefaultResult: "A shippable, maintainable product system with room to evolve",
    projectDefaultStack: "Next.js / TypeScript / Prisma",
    viewDetail: "View case",
    capability: "Capability System",
    capabilityTitle: "Five layers behind a premium Web project.",
    capabilityLead: "A refined site needs visual quality, structure, engineering, content, and iteration mechanisms to work together.",
    capabilityItems: [
      ["Full-stack delivery", "Connecting pages, APIs, database, admin tools, permissions, and deployment into one working flow."],
      ["Product structure", "Clarifying user paths, information hierarchy, content models, and maintenance cost."],
      ["Interface craft", "Polishing layout, spacing, states, motion, mobile behavior, and readability until the work feels calm and memorable."],
      ["Content clarity", "Turning abstract ability into concrete cases, judgments, outcomes, and reusable methods."],
      ["AI collaboration", "Using AI for research, framing, implementation, review, and retrospectives while validating quality with evidence."]
    ],
    writing: "Writing / Guides",
    writingTitle: "I turn project judgment into reusable assets.",
    writingLead: "Writing and guides preserve engineering, design, AI workflow, and product tradeoffs so experience becomes momentum for the next build.",
    readArticle: "Read article",
    featuredLabel: "Featured",
    guideTitle: "Guides",
    guideLead: "Reusable guides for AI collaboration, full-stack development, product judgment, and interface polish.",
    guideCountLabel: "guides",
    guideAction: "Open guides",
    now: "Now",
    nowTitle: "Current focus, publicly updated.",
    nowLead: "Now keeps a lighter record of current projects, research threads, and next steps so the site feels like a living workbench, not a frozen portfolio.",
    nowFallback: [
      ["Project notes", "Expanding case studies for Machi, the personal site, and content systems.", "In progress", "Build", 72],
      ["AI workflow", "Refining the path from requirement framing to code review.", "Improving", "Research", 64],
      ["Visual system", "Polishing the bright background, cards, typography, and mobile experience.", "Polishing", "Design", 58]
    ],
    finalTitle: "If an idea is worth polishing, we can move it toward something shippable, maintainable, and worth revisiting.",
    finalLead: "Useful for personal brand sites, portfolios, content systems, full-stack prototypes, AI-assisted workflows, and Web projects that need to move from requirements to deployment."
  }
} as const;

const capabilityIcons = [Code2, Compass, BrainCircuit, PenLine, Rocket];

const projectTranslations: Record<string, Partial<Record<Locale, Pick<Project, "title" | "excerpt" | "category">>>> = {
  "personal-intelligence-dashboard": {
    ja: {
      title: "個人インテリジェンス・ワークベンチ",
      excerpt: "ノート、目標、コンテンツの種、AI による計画支援を一つにまとめた個人運用システム。",
      category: "生産性ツール"
    },
    en: {
      title: "Personal Intelligence Workbench",
      excerpt: "A personal operating system that connects notes, goals, content ideas, and AI-assisted planning.",
      category: "Productivity Tool"
    }
  },
  "brand-cms-creator-portfolios": {
    ja: {
      title: "クリエイター向け個人ブランド CMS",
      excerpt: "深い制作実績と編集権限が必要なクリエイターのためのコンテンツ管理体験。",
      category: "コンテンツシステム"
    },
    en: {
      title: "Creator Brand CMS",
      excerpt: "A content management experience for creators who need deep case studies and editorial control.",
      category: "Content System"
    }
  },
  "bright-content-universe-website": {
    ja: {
      title: "明るい流体感の個人サイト",
      excerpt: "ガイド、制作実績、記事、リソース、方法論をつなぐ個人ブランドプロダクト。",
      category: "個人ブランド"
    },
    en: {
      title: "Bright Fluid Personal Website",
      excerpt: "A personal brand product that connects guides, projects, writing, resources, and methods.",
      category: "Personal Brand"
    }
  },
  "machi-ios-native-city-life-app": {
    ja: {
      title: "Machi iOS ネイティブ都市生活アプリ",
      excerpt: "SwiftUI + SwiftData によるオフライン優先の都市生活クライアント。",
      category: "iOS App"
    },
    en: {
      title: "Machi iOS Native City App",
      excerpt: "An offline-first SwiftUI + SwiftData city-life client with feed, posting, messages, and notifications.",
      category: "iOS App"
    }
  },
  "machi-web-unified-python-backend": {
    ja: {
      title: "Machi Web と統一 Python バックエンド",
      excerpt: "Next.js Web、Python バックエンド、SQLite をつなぐ本格的なローカルライフ基盤。",
      category: "Web / Backend"
    },
    en: {
      title: "Machi Web and Unified Python Backend",
      excerpt: "A production-grade Next.js client with a Python backend and SQLite data layer shared with iOS.",
      category: "Web / Backend"
    }
  }
};

const articleTranslations: Record<string, Partial<Record<Locale, Pick<Article, "title" | "excerpt" | "category">>>> = {
  "ai-native-product-workflows": {
    ja: {
      title: "AI ネイティブなプロダクトワークフローをどう捉えるか",
      excerpt: "AI を単発の機能ではなく、日常のプロダクト実行層に組み込むための実践フレーム。",
      category: "AI ワークフロー"
    },
    en: {
      title: "How I Understand AI-Native Product Workflows",
      excerpt: "A practical framework for moving AI from a shiny feature into everyday product execution.",
      category: "AI Workflow"
    }
  },
  "calm-interfaces-under-pressure": {
    ja: {
      title: "高圧な場面でも落ち着いて使える UI の設計",
      excerpt: "運用画面に必要な情報密度、階層、抑制された表現のバランスについて。",
      category: "デザイン"
    },
    en: {
      title: "Designing Calm Interfaces Under Pressure",
      excerpt: "How I balance density, hierarchy, and restraint in operational product interfaces.",
      category: "Design"
    }
  },
  "fluid-gradient-personal-site-principles": {
    ja: {
      title: "流体グラデーション個人サイトの設計原則",
      excerpt: "明るさ、夢のある色、プロらしさを両立させるための視覚システム。",
      category: "デザイン"
    },
    en: {
      title: "Design Principles for a Fluid Gradient Personal Site",
      excerpt: "A bright visual system where color, motion, and hierarchy support the content.",
      category: "Design"
    }
  },
  "why-i-redesigned-my-personal-website": {
    ja: {
      title: "なぜ自分の個人サイトを作り直したのか",
      excerpt: "個人サイトは公開当日だけ綺麗で終わるものではなく、現在の仕事と判断を継続的に見せるべきです。",
      category: "個人ブランド"
    },
    en: {
      title: "Why I Redesigned My Personal Website",
      excerpt: "A personal site should keep showing what I am building, how I judge problems, and which projects are truly polished.",
      category: "Personal Brand"
    }
  },
  "ai-codes-fast-judgement-is-hard": {
    ja: {
      title: "AI は速くコードを書く。でも本当に難しいのは判断",
      excerpt: "AI は実装を速くしますが、境界、品質、リスク、維持コストの判断は人間が担います。",
      category: "AI ワークフロー"
    },
    en: {
      title: "AI Codes Fast, but Judgment Is the Hard Part",
      excerpt: "AI can speed up implementation, but boundaries, quality standards, launch risk, and maintenance still need human judgment.",
      category: "AI Workflow"
    }
  }
};

export function UniverseHome({ locale, siteName, avatarUrl, projects, articles, guides, nowItems }: UniverseHomeProps) {
  const t = copy[locale];
  const selectedProjects = preferFeatured(projects).slice(0, 3).map((project) => localizeProject(project, locale));
  const selectedArticles = preferFeatured(articles).slice(0, 2).map((article) => localizeArticle(article, locale));
  const visibleNow = nowItems.length
    ? nowItems.slice(0, 3)
    : t.nowFallback.map(([title, description, status, type, progress], index) => ({
        id: `fallback-${index}`,
        title,
        description,
        status,
        type,
        progress
      }));

  return (
    <div className="relative overflow-hidden pb-8">
      <section className="wide-container relative grid gap-10 pb-14 pt-32 md:pb-20 md:pt-36 lg:min-h-[74svh] lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div className="min-w-0">
          <Badge className="mb-5">{t.heroBadge}</Badge>
          <h1 className="hero-copy text-5xl font-black leading-none text-slate-950 sm:text-6xl md:text-7xl lg:text-8xl">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-full text-lg font-bold leading-8 text-slate-800 sm:text-xl md:text-2xl">
            <RoleSubtitle text={t.heroSubtitle} />
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg md:leading-9">{t.heroLead}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {t.tags.map((tag) => (
              <span key={tag} className="max-w-full rounded-full border border-indigo-200/70 bg-white/76 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-8 grid max-w-sm gap-3 sm:flex sm:max-w-none sm:flex-wrap">
            <MagneticButton href={withLocalePath("/projects", locale)} className="w-full sm:w-auto">
              {t.workCta}
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href={withLocalePath("/contact", locale)} variant="secondary" className="w-full sm:w-auto">
              {t.contactCta}
              <Mail className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>

        <aside className="relative mx-auto w-full max-w-xl rounded-lg border border-slate-900/10 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-xl md:p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50">
              <Image src={avatarUrl} alt={siteName} fill className="object-cover p-4" sizes="96px" priority />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-950">{siteName}</p>
              <p className="mt-1 max-w-full text-sm font-semibold leading-6 text-slate-500">
                <RoleSubtitle text={t.heroSubtitle} />
              </p>
            </div>
          </div>
          <div className="mt-7">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{t.proofLabel}</p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950 md:text-3xl">{t.proofTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t.proofLead}</p>
          </div>
          <div className="mt-6 grid gap-3">
            {t.proofItems.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 border-t border-slate-900/10 pt-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">{t.workflowLabel}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{t.workflowLine}</p>
          </div>
        </aside>
      </section>

      <section className="section-container scroll-mt-28 py-12 md:py-16">
        <SectionIntro eyebrow={t.selectedWork} title={t.selectedWorkTitle} description={t.selectedWorkLead} />
        <div className="grid gap-5 lg:grid-cols-3">
          {selectedProjects.map((project) => (
            <ProjectTile
              key={project.id}
              project={project}
              locale={locale}
              labels={{
                problem: t.projectProblem,
                role: t.projectRole,
                stack: t.projectStack,
                result: t.projectResult,
                action: t.viewDetail,
                defaultRole: t.projectDefaultRole,
                defaultResult: t.projectDefaultResult,
                defaultStack: t.projectDefaultStack
              }}
            />
          ))}
        </div>
      </section>

      <section className="section-container scroll-mt-28 py-12 md:py-16">
        <SectionIntro eyebrow={t.capability} title={t.capabilityTitle} description={t.capabilityLead} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {t.capabilityItems.map(([title, description], index) => {
            const Icon = capabilityIcons[index] ?? Code2;
            return <CapabilityCard key={title} title={title} description={description} icon={<Icon className="h-5 w-5" />} />;
          })}
        </div>
      </section>

      <section className="section-container scroll-mt-28 py-12 md:py-16">
        <SectionIntro eyebrow={t.writing} title={t.writingTitle} description={t.writingLead} />
        <div className="grid gap-5 lg:grid-cols-3">
          {selectedArticles.map((article) => (
            <ArticleTile key={article.id} article={article} locale={locale} label={t.readArticle} featuredLabel={t.featuredLabel} />
          ))}
          <GuideHubTile
            locale={locale}
            count={guides.length}
            title={t.guideTitle}
            lead={t.guideLead}
            countLabel={t.guideCountLabel}
            action={t.guideAction}
          />
        </div>
      </section>

      <section className="section-container scroll-mt-28 py-12 md:py-16">
        <SectionIntro eyebrow={t.now} title={t.nowTitle} description={t.nowLead} />
        <div className="grid gap-5 lg:grid-cols-3">
          {visibleNow.map((item) => (
            <NowTile key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-900/10 bg-white/72 py-16 backdrop-blur md:py-20">
        <div className="section-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Contact
            </div>
            <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-slate-950 md:text-6xl">{t.finalTitle}</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{t.finalLead}</p>
          </div>
          <MagneticButton href={withLocalePath("/contact", locale)}>
            {t.contactCta}
            <Rocket className="h-4 w-4" />
          </MagneticButton>
        </div>
      </section>
    </div>
  );
}

function preferFeatured<T extends { featured: boolean }>(items: T[]) {
  return [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
}

function localizeProject(project: Project, locale: Locale): Project {
  const translated = projectTranslations[project.slug]?.[locale];
  return translated ? { ...project, ...translated } : project;
}

function localizeArticle(article: Article, locale: Locale): Article {
  const translated = articleTranslations[article.slug]?.[locale];
  return translated ? { ...article, ...translated } : article;
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-9 max-w-3xl">
      <Badge className="mb-4">{eyebrow}</Badge>
      <h2 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">{description}</p> : null}
    </div>
  );
}

function RoleSubtitle({ text }: { text: string }) {
  const [primary, secondary] = text.split(" · ");

  if (!secondary) return text;

  return (
    <>
      {primary}
      <span className="hidden sm:inline"> · </span>
      <span className="block break-words sm:inline">{secondary}</span>
    </>
  );
}

function ProjectTile({
  project,
  locale,
  labels
}: {
  project: Project;
  locale: Locale;
  labels: {
    problem: string;
    role: string;
    stack: string;
    result: string;
    action: string;
    defaultRole: string;
    defaultResult: string;
    defaultStack: string;
  };
}) {
  const stack = project.techStack.slice(0, 3).join(" / ") || labels.defaultStack;
  const problem = locale === "zh" ? project.challenge || project.excerpt : project.excerpt;
  const role = locale === "zh" ? project.role || labels.defaultRole : labels.defaultRole;
  const result = locale === "zh" ? project.result || labels.defaultResult : labels.defaultResult;

  return (
    <Link href={withLocalePath(`/projects/${project.slug}`, locale)} className="group grid h-full overflow-hidden rounded-lg border border-slate-900/10 bg-white/82 shadow-[0_16px_44px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_22px_58px_rgba(15,23,42,0.11)] focus-ring">
      <div className="relative aspect-[16/10] bg-indigo-50">
        {project.coverImage ? (
          <Image src={project.coverImage} alt={project.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 33vw" />
        ) : null}
      </div>
      <article className="flex flex-col p-5">
        <Badge>{project.category}</Badge>
        <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">{project.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{project.excerpt}</p>
        <div className="mt-5 grid gap-2 text-xs leading-5 text-slate-600">
          <DetailLine label={labels.problem} value={problem} />
          <DetailLine label={labels.role} value={role} />
          <DetailLine label={labels.stack} value={stack} />
          <DetailLine label={labels.result} value={result} />
        </div>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
          {labels.action}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </article>
    </Link>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-black text-slate-900">{label}: </span>
      {value}
    </p>
  );
}

function CapabilityCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-lg border border-slate-900/10 bg-white/80 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.07)] backdrop-blur">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-50 text-indigo-700">{icon}</div>
      <h3 className="mt-6 text-xl font-black leading-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}

function ArticleTile({ article, locale, label, featuredLabel }: { article: Article; locale: Locale; label: string; featuredLabel: string }) {
  return (
    <Link href={withLocalePath(`/blog/${article.slug}`, locale)} className="group block h-full rounded-lg border border-slate-900/10 bg-white/82 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_22px_58px_rgba(15,23,42,0.11)] focus-ring">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{article.category}</Badge>
        {article.featured ? <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-black leading-none text-white">{featuredLabel}</span> : null}
      </div>
      <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">{article.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
        {label}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function GuideHubTile({
  locale,
  count,
  title,
  lead,
  countLabel,
  action
}: {
  locale: Locale;
  count: number;
  title: string;
  lead: string;
  countLabel: string;
  action: string;
}) {
  return (
    <Link href={withLocalePath("/guide", locale)} className="group block h-full rounded-lg border border-indigo-200/70 bg-indigo-50/80 p-5 text-slate-950 shadow-[0_16px_44px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-indigo-300 hover:bg-white focus-ring">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-indigo-700 shadow-sm">
        <BookOpen className="h-5 w-5" />
      </div>
      <p className="mt-6 text-xs font-black uppercase tracking-wide text-indigo-700">
        {count} {countLabel}
      </p>
      <h3 className="mt-3 text-2xl font-black leading-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{lead}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
        {action}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function NowTile({ item }: { item: NowItem }) {
  const progress = Math.max(0, Math.min(100, item.progress));

  return (
    <article className="rounded-lg border border-slate-900/10 bg-white/82 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.07)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <Badge>{item.type}</Badge>
        <span className="text-xs font-black text-indigo-700">{item.status}</span>
      </div>
      <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-sky-500" style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}
