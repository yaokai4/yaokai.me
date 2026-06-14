import { flattenCopyValues, type CopyOverrides } from "@/lib/copy-overrides";
import { shellCopy } from "@/lib/i18n";
import { siteCopy } from "@/lib/public-copy";

export const rootMetadataCopy = {
  zh: {
    title: "姚凯 / Yao Kai - 独立开发者，日本在住",
    description: "姚凯的个人网站：作品、开发笔记、技术栈，以及在日本生活和做产品时留下的记录。"
  },
  ja: {
    title: "姚凱 / よう がい - 日本在住の個人開発者",
    description: "姚凱の個人サイト。制作実績、開発メモ、技術スタック、日本で暮らしながらプロダクトを作る日々の記録。"
  },
  en: {
    title: "Yao Kai - Independent Developer in Japan",
    description: "Yao Kai's personal site: work, development notes, stack, and a living record of building products in Japan."
  }
} as const;

const homeCopy = {
  zh: {
    eyebrow: "个人开发 / 日本生活",
    heroTitle: "姚凯 / Yao Kai",
    heroSubtitle: "在日本把想法写成产品，也把日常写成记录。",
    heroLead:
      "我在日本生活、写代码，也做自己的产品。Machi 是面向城市生活的本地社区，Shangence 商衡帮助人在创业或开店前先把风险想清楚。这个网站不是一份静态简历：它会放作品、开发笔记、技术选择，也会留下一些在日本生活时慢慢形成的观察。",
    workCta: "看作品",
    resumeCta: "看简历",
    runningLabel: "正在运营",
    runningNote: "本站代码公开在 GitHub",
    proofEyebrow: "可验证信号",
    proofTitle: "我在意的是，把产品交到真实世界里。",
    proofLead: "从第一版、上线、运营到问题修复，很多细节只有真的做过才会留下痕迹。",
    projectsEyebrow: "作品",
    projectsTitle: "先从几个真实的入口看我。",
    projectsLead: "Machi 和 Shangence 是我独立做的两个产品；yaokai.me 是这个个人网站和后台。作品页里会把 Machi 的 Web / iOS / Android，以及每个项目背后的取舍拆开写清楚。",
    scopeEyebrow: "能力范围",
    scopeTitle: "一个人，也要把事情做完整。",
    writingEyebrow: "文章",
    writingTitle: "开发笔记，以及生活里慢慢形成的判断。",
    writingLead: "这里会写踩过的坑、做产品时的取舍，也会留下一些在日本生活、求职和观察城市时的记录。",
    ctaTitle: "如果你想找一个能把想法推进到上线的人，我们可以从一封邮件开始。",
    ctaLead: "邮件最快。你也可以先看完作品，再慢慢判断要不要聊。",
    ctaButton: "联系我"
  },
  ja: {
    eyebrow: "個人開発 / 日本での暮らし",
    heroTitle: "姚凱 / よう がい",
    heroSubtitle: "日本で暮らしながら、アイデアをプロダクトにしている開発者です。",
    heroLead:
      "日本で生活しながら、Machi と Shangence 商衡を企画・開発・運用しています。Machi は都市の暮らしに寄り添うローカルコミュニティ、Shangence は事業を始める前にリスクを整理するためのサービスです。このサイトには、制作実績、開発メモ、技術の判断、そして日々の小さな記録を残していきます。",
    workCta: "制作実績を見る",
    resumeCta: "経歴を見る",
    runningLabel: "運用中",
    runningNote: "このサイトのコードは GitHub で公開",
    proofEyebrow: "検証できる実績",
    proofTitle: "きれいな画面だけでなく、動き続けるものを作ります。",
    proofLead: "初版を出し、運用し、不具合を直し、次の改善を考える。その一連の手触りが伝わるようにまとめています。",
    projectsEyebrow: "制作実績",
    projectsTitle: "まずは、実際に動いているものから。",
    projectsLead: "Machi と Shangence は一人で作っている2つのプロダクトです。yaokai.me はこの個人サイトと管理画面。制作実績ページでは、Machi の Web / iOS / Android と、それぞれの判断を分けて見られます。",
    scopeEyebrow: "担当範囲",
    scopeTitle: "一人でも、最後まで形にする。",
    writingEyebrow: "記事",
    writingTitle: "開発メモと、生活の中で考えたこと。",
    writingLead: "設計で迷ったこと、実装で詰まったこと、日本で暮らす中で残しておきたくなったことを、少しずつ文章にします。",
    ctaTitle: "一緒に作りたいものがある方へ。",
    ctaLead: "メールが一番確実です。作品を見てから、気軽に声をかけてください。",
    ctaButton: "連絡する"
  },
  en: {
    eyebrow: "Independent developer / life in Japan",
    heroTitle: "Yao Kai",
    heroSubtitle: "I turn small, stubborn ideas into shipped products.",
    heroLead:
      "I live in Japan, write code, and build products of my own. Machi is a local community for city life; Shangence helps people think through business risk before opening a shop or starting a venture. This site is not a static resume. It is where I keep the work, the technical notes, the trade-offs, and a few observations from life here.",
    workCta: "See the work",
    resumeCta: "Resume",
    runningLabel: "In production",
    runningNote: "This site is open source on GitHub",
    proofEyebrow: "Verifiable signals",
    proofTitle: "I care about getting products into the real world.",
    proofLead: "The first version, the launch, the fixes, the quiet maintenance after launch — those details leave a trace.",
    projectsEyebrow: "Work",
    projectsTitle: "Start with a few things that actually exist.",
    projectsLead: "Machi and Shangence are the two products I build solo. yaokai.me is this personal site and CMS. The work page separates Machi into Web, iOS, and Android, and explains the choices behind each part.",
    scopeEyebrow: "Scope",
    scopeTitle: "One person, but the work still has to be complete.",
    writingEyebrow: "Writing",
    writingTitle: "Development notes, and the thinking that gathers around the work.",
    writingLead: "Bugs I ran into, product trade-offs, notes from job hunting in Japan, and small observations from the places I live through.",
    ctaTitle: "If you need someone who can move an idea toward launch, start with an email.",
    ctaLead: "Email is fastest. Reading through the work first is perfectly fine too.",
    ctaButton: "Contact me"
  }
} as const;

const stackCopy = {
  zh: {
    metaTitle: "技术栈 - 姚凯",
    metaDescription: "姚凯的技术栈：前端体验、系统工程、移动端、AI 工作流、设计判断、部署与自动化如何服务真实产品。",
    eyebrow: "技术栈",
    title: "技术对我来说，不是 Logo 墙，而是判断和交付的工具。",
    description: "这里展示我如何组合前端、后端、数据库、移动端、部署、设计工具、AI 工具和自动化，让一个想法慢慢变成可上线、可维护、能继续生长的产品系统。",
    narratives: [
      ["前端体验", "我关心的不只是页面能不能运行，而是信息层级、交互反馈、动效节奏和移动端阅读是否一起服务用户。"],
      ["系统工程", "从数据库模型、API 契约、后台管理、权限边界到部署脚本，我希望项目在上线之后仍然容易理解和维护。"],
      ["AI 工作流", "我把 AI 当作调研、设计、开发和内容整理的协作层，但最终仍由真实体验和工程质量来验收。"]
    ],
    skillTitle: "按能力组织，而不是堆技术名词。",
    skillDescription: "每项技术都要回答三个问题：我用它解决什么、为什么选择它、它如何帮助真实项目继续前进。",
    resourceTitle: "这些工具和文档，是我长期放在手边的工作台。",
    resourceDescription: "技术栈不是静态清单，它会随着项目复杂度、产品目标、协作方式和审美判断一起变化。"
  },
  ja: {
    metaTitle: "技術スタック - 姚凱",
    metaDescription: "フロントエンド、システム設計、モバイル、AI ワークフロー、デザイン判断、デプロイ、自動化を整理。",
    eyebrow: "技術スタック",
    title: "技術はロゴの一覧ではなく、判断して届けるための道具です。",
    description: "フロントエンド、バックエンド、データベース、モバイル、デプロイ、デザインツール、AI ツール、自動化をどう組み合わせているかを整理しています。目的は、アイデアを公開でき、運用でき、後から育てられる形にすることです。",
    narratives: [
      ["フロント体験", "動くだけでなく、情報の見せ方、反応、動き、モバイルでの読みやすさが目的に合っているかを見ます。"],
      ["システム設計", "データモデル、API、管理画面、権限、デプロイまで、公開後も理解しやすく保守しやすい構造を重視します。"],
      ["AI ワークフロー", "AI を調査、設計、開発、内容整理の協業層として使います。ただし最終的な品質は、体験と実装で確認します。"]
    ],
    skillTitle: "技術名ではなく、できることの単位で整理します。",
    skillDescription: "それぞれの技術について、何を解くために使うのか、なぜ選ぶのか、実際のプロジェクトにどう効くのかを見ます。",
    resourceTitle: "長く手元に置く道具と資料が、作業台をつくります。",
    resourceDescription: "技術スタックは固定リストではありません。プロジェクトの複雑さ、目的、協業のしかた、見せ方の判断に合わせて変わっていきます。"
  },
  en: {
    metaTitle: "Stack - Yaokai",
    metaDescription: "Yaokai's stack across front-end experience, systems engineering, mobile, AI workflows, design judgment, deployment, and automation.",
    eyebrow: "Stack",
    title: "Technology is not a logo wall. It is how I make decisions and ship.",
    description: "How I combine front end, back end, databases, mobile clients, deployment, design tools, AI tools, and automation to move an idea toward something shippable, maintainable, and still able to grow.",
    narratives: [
      ["Front-end experience", "I care whether hierarchy, feedback, motion, mobile reading, and accessibility serve the user, not only whether the page runs."],
      ["Systems engineering", "From data models and API contracts to admin tools, permissions, and deployment scripts, I build so the project is still understandable after launch."],
      ["AI workflow", "I use AI as a collaboration layer for research, design, development, and content, then validate the result through real experience and engineering checks."]
    ],
    skillTitle: "Organized by capability, not by technology names.",
    skillDescription: "Each tool should answer what problem it helps me solve, why I choose it, and how it supports real projects.",
    resourceTitle: "These tools and docs form the workbench I keep returning to.",
    resourceDescription: "A stack is not a static list. It changes with project complexity, product goals, collaboration style, and visual judgment."
  }
} as const;

const aboutCopy = {
  title: {
    zh: "Web 应用 / 全栈工程师",
    ja: "Webアプリケーション / フルスタックエンジニア",
    en: "Web Application / Full-Stack Engineer"
  },
  summary: {
    zh: "中国出身、现居日本。跨越 Web、iOS、Android、后端、数据库与 AWS，从发现课题、需求定义、UI/UX 设计到实现、部署、运维改善一贯完成的全栈工程师。个人开发中独立完成了城市本地生活社区平台「Machi」（Web / iOS / Android + 共通 API）与面向日本市场的事业风险诊断服务「Shangence 商衡」（诊断・Stripe 支付・PDF 报告・管理后台）两个产品的企划到公开运营。强项是包含支付、管理后台、法务与安全设计在内、以真实运营为前提的产品开发。",
    ja: "中国出身・日本在住。Web、iOS、Android、バックエンド、データベース、AWS を横断し、課題発見から要件定義、UI/UX設計、実装、デプロイ、運用改善まで一貫して取り組むフルスタック志向のエンジニアです。個人開発では、都市別ローカルライフ・コミュニティプラットフォーム「Machi」（Web / iOS / Android+共通API）と、日本市場向け事業リスク診断サービス「Shangence 商衡」（診断・Stripe決済・PDFレポート・管理画面）の2プロダクトを、企画から公開・運用まで一人で完遂しました。決済、管理画面、法務・安全設計まで含めた、実運用を見据えたプロダクト開発を強みとしています。",
    en: "Born in China, based in Japan. A full-stack engineer working across Web, iOS, Android, backend, databases and AWS — from problem discovery, requirements and UI/UX design to implementation, deployment, and operations. As a solo builder I shipped two products end to end: Machi, a city-based local-life community platform (Web / iOS / Android with a shared API), and Shangence, a business-risk assessment service for the Japanese market (assessment, Stripe payments, PDF reports, admin console). My strength is production-grade product development that includes payments, admin tooling, legal pages and safety design."
  },
  valueLabel: { zh: "能提供的价值", ja: "提供できる価値", en: "What I bring" },
  values: {
    zh: [
      "连接 Web・移动端・API・DB・云的产品整体设计与实现",
      "快速公开 MVP，并以运营、收益化为前提阶段性扩展的设计力",
      "从投稿、搜索、咨询、会员、支付到管理后台，完整构建过事业所需链路的经验",
      "多语言 UI（日中英）+ 基于日本市场法务与安全要求的服务设计"
    ],
    ja: [
      "Web・モバイル・API・DB・クラウドをつなぐプロダクト全体の設計と実装",
      "MVPを素早く公開し、運用・収益化を見据えて段階的に拡張する設計力",
      "投稿・検索・問い合わせ・会員・決済・管理画面まで、事業に必要な導線を一通り構築した経験",
      "多言語UI（日・中・英）と、日本市場の法務・安全要件を踏まえたサービス設計"
    ],
    en: [
      "End-to-end product design and implementation across web, mobile, API, database and cloud",
      "Shipping MVPs fast, then scaling them deliberately with operations and monetization in mind",
      "Hands-on experience building the full business funnel: posting, search, inquiries, membership, payments and admin",
      "Multilingual UI (JA / ZH / EN) and service design aligned with Japanese legal and safety requirements"
    ]
  },
  prTitle: {
    zh: "发现课题、落成规格、完成公开与运营的能力",
    ja: "課題を見つけ、仕様に落とし込み、公開・運用まで完遂する力",
    en: "Finding problems, specifying them, and carrying them through to launch and operations"
  },
  pr1: {
    zh: "我重视的不是孤立地学习技术，而是把它做成真正被使用的服务。在 Machi 中横跨 Web・iOS・Android・API・AWS 进行设计与实现，在 Shangence 中独立构建了诊断、支付、PDF、管理后台以及法务与安全设计。我完整经历过从需求模糊的阶段整理课题、以 MVP 形式公开、再在运营中持续改善的全过程。",
    ja: "私は、技術を個別に学ぶだけでなく、実際に使われるサービスとして形にすることを重視しています。Machi では Web・iOS・Android・API・AWS を横断して設計・実装し、Shangence では診断、決済、PDF、管理画面、法務・安全設計まで一人で構築しました。要件が曖昧な段階から課題を整理し、MVPとして公開し、運用しながら改善する一連の流れを経験しています。",
    en: "I care less about learning technologies in isolation and more about turning them into services people actually use. For Machi I designed and built across Web, iOS, Android, API and AWS; for Shangence I built everything solo — assessment logic, payments, PDF reports, the admin console, and the legal and safety design. I have been through the full cycle of clarifying vague requirements, shipping an MVP, and improving it in production."
  },
  pr2: {
    zh: "此外，通过 Java 研修讲师、销售与物流现场的经验，我培养了因人而异的讲解能力、遵守标准与安全的姿态以及协作能力。入职后，我会先在 Web 应用开发上稳定输出价值，再发挥能理解后端、移动端与云的优势，为打造被长期使用的产品做出贡献。",
    ja: "また、Java研修講師、販売、物流現場での経験を通じて、相手に合わせて説明する力、標準・安全を守る姿勢、協働する力を培いました。入社後は、Webアプリケーション開発で確実に価値を出しつつ、バックエンド・モバイル・クラウドまで理解できる強みを活かし、長く使われるプロダクトづくりに貢献します。",
    en: "Working as a Java instructor, in retail sales and in logistics taught me to explain things at the listener's level, to respect standards and safety, and to collaborate. After joining, I will deliver value in web application development first, then use my cross-stack understanding of backend, mobile and cloud to help build products that last."
  },
  download: { zh: "下载 PDF 简历（日文）", ja: "職務経歴書 PDF をダウンロード", en: "Download resume PDF (Japanese)" },
  contactCta: { zh: "联系我", ja: "お問い合わせ", en: "Contact me" }
} as const;

const contactCopy = {
  zh: {
    metadata: {
      title: "联系 - 姚凯",
      description: "联系姚凯，讨论职位机会、项目合作、Machi、Shangence 商衡或网站相关问题。"
    },
    eyebrow: "联系",
    title: "找我聊职位、合作，或者直接问项目细节都可以。",
    description: "我现在主要关注日本的 Web / 全栈开发机会，也欢迎围绕 Machi、Shangence 商衡、个人网站、App 上架和产品实现聊一聊。",
    collaborationBody: "希望参与 Web 应用、全栈开发、自社服务、前端、iOS / Android 相关工作。远程或线下都可以具体聊。",
    fitTitle: "可以聊什么",
    fitBody: "职位机会、项目合作、代码仓库、作品集、简历、Machi / Shangence 的实现细节，或者这个网站本身。"
  },
  ja: {
    metadata: {
      title: "お問い合わせ - 姚凱",
      description: "姚凱へのお問い合わせ。求人、協業、Machi、Shangence 商衡、このサイトについて。"
    },
    eyebrow: "連絡",
    title: "求人、協業、プロジェクトの詳細など、お気軽にご連絡ください。",
    description: "現在は日本での Web / フルスタック開発の機会を中心に探しています。Machi、Shangence 商衡、個人サイト、アプリ公開準備についても話せます。",
    collaborationBody: "Webアプリ、フルスタック、自社サービス、フロントエンド、iOS / Android 関連の仕事に関心があります。リモート・対面どちらも相談できます。",
    fitTitle: "相談できること",
    fitBody: "求人、協業、コード、制作実績、職務経歴、Machi / Shangence の実装、このサイトについて。"
  },
  en: {
    metadata: {
      title: "Contact - Yaokai",
      description: "Contact Yaokai about roles, collaboration, Machi, Shangence, or this website."
    },
    eyebrow: "Contact",
    title: "Reach out about roles, collaboration, or details behind the projects.",
    description: "I am looking mainly at Web / full-stack opportunities in Japan, and I am happy to talk about Machi, Shangence, this site, app release prep, or product implementation.",
    collaborationBody: "I am interested in Web apps, full-stack roles, in-house products, frontend, and iOS / Android adjacent work. Remote or in-person can both work.",
    fitTitle: "Good things to discuss",
    fitBody: "Roles, collaboration, source code, portfolio details, resume, Machi / Shangence implementation, or this site itself."
  }
} as const;

const contactFormCopy = {
  zh: {
    title: "告诉我你想构建什么。",
    description: "最好包含目标、当前状态、期望结果和时间范围，我会更快判断如何推进。",
    name: "姓名",
    email: "邮箱",
    message: "留言",
    messagePlaceholder: "告诉我你想一起构建或讨论什么。",
    submit: "发送留言",
    successDescription: "我会尽快回复你。"
  },
  ja: {
    title: "作りたいものを教えてください。",
    description: "目的、現在の状態、期待する結果、希望時期を書いていただくと判断しやすくなります。",
    name: "お名前",
    email: "メール",
    message: "メッセージ",
    messagePlaceholder: "相談したい内容を教えてください。",
    submit: "送信する",
    successDescription: "できるだけ早く返信します。"
  },
  en: {
    title: "Tell me what you want to build.",
    description: "Share the goal, current state, expected outcome, and timeline so I can respond with better context.",
    name: "Name",
    email: "Email",
    message: "Message",
    messagePlaceholder: "Tell me what you want to build or discuss.",
    submit: "Send message",
    successDescription: "I will reply as soon as I can."
  }
} as const;

const libraryCopy = {
  zh: {
    metaTitle: "资源库 - 姚凯",
    metaDescription: "姚凯长期使用、参考和推荐的开发、设计、AI、产品与内容资源。",
    eyebrow: "Library",
    title: "一个面向创造者的高质量资源库。",
    description: "这里不是普通链接收藏，而是我在真实项目中反复使用、验证和参考的工具、文档、设计灵感、AI 工作流与工程资源。"
  },
  ja: {
    metaTitle: "リソース - 姚凱",
    metaDescription: "開発、デザイン、AI、プロダクト、文章づくりのために実際に使っているリソース。",
    eyebrow: "Library",
    title: "作る人のための、手元に置いておきたいリソース集。",
    description: "ただのリンク集ではありません。実際のプロジェクトで使い、何度も読み返し、判断の基準にしているツール、ドキュメント、デザイン参考、AI ワークフローをまとめています。"
  },
  en: {
    metaTitle: "Library - Yaokai",
    metaDescription: "Development, design, AI, product, and writing resources I actually use and revisit.",
    eyebrow: "Library",
    title: "A considered resource library for people who build.",
    description: "Not a random bookmark list. These are tools, docs, design references, AI workflows, and engineering resources I use, revisit, and test through real projects."
  }
} as const;

export function getSiteCopyDefaultValues(): CopyOverrides {
  const defaults: CopyOverrides = {};
  flattenCopyValues(rootMetadataCopy, "root", defaults);
  flattenCopyValues(shellCopy, "shell", defaults);
  flattenCopyValues(homeCopy, "home", defaults);
  flattenCopyValues(siteCopy, "site", defaults);
  flattenCopyValues(stackCopy, "stack", defaults);
  flattenCopyValues(aboutCopy, "about", defaults);
  flattenCopyValues(contactCopy, "contact", defaults);
  flattenCopyValues(contactFormCopy, "contactForm", defaults);
  flattenCopyValues(libraryCopy, "library", defaults);
  return defaults;
}
