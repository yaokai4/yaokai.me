import { ArrowRight, Download, ExternalLink, Github, Globe, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { withLocalePath, type Locale } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const RESUME_PDF = "/resume/yaokai-resume-ja.pdf";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const titles = {
    zh: "关于我 / 简历 - 姚凯",
    ja: "プロフィール / 職務経歴 - 姚凱",
    en: "About / Resume - Yao Kai"
  } as const;
  const descriptions = {
    zh: "姚凯的完整简历：跨 Web / iOS / Android / Backend / AWS 的全栈工程师，Machi 与 Shangence 商衡的开发者。",
    ja: "姚凱の職務経歴。Web / iOS / Android / Backend / AWS を横断するフルスタックエンジニア。Machi と Shangence 商衡の開発者。",
    en: "Full resume of Yao Kai: a product-minded full-stack engineer across Web, iOS, Android, Backend and AWS. Builder of Machi and Shangence."
  } as const;

  return createMetadata({
    title: titles[locale],
    description: descriptions[locale],
    path: "/about",
    locale
  });
}

/* ---------- trilingual copy ---------- */

type L<T = string> = Record<Locale, T>;

const t = {
  eyebrow: { zh: "职务经历书 | RESUME", ja: "職務経歴書 | RESUME", en: "RESUME | 職務経歴書" } as L,
  asOf: { zh: "2026年6月 更新", ja: "2026年6月現在", en: "Updated June 2026" } as L,
  title: {
    zh: "Web 应用 / 全栈工程师",
    ja: "Webアプリケーション / フルスタックエンジニア",
    en: "Web Application / Full-Stack Engineer"
  } as L,
  subtitle: {
    zh: "Product-minded Engineer — Web・iOS・Android・Backend・AWS",
    ja: "Product-minded Engineer — Web・iOS・Android・Backend・AWS",
    en: "Product-minded Engineer — Web・iOS・Android・Backend・AWS"
  } as L,
  summaryLabel: { zh: "职务概要", ja: "職務要約", en: "Profile" } as L,
  summary: {
    zh: "中国出身、现居日本。跨越 Web、iOS、Android、后端、数据库与 AWS，从发现课题、需求定义、UI/UX 设计到实现、部署、运维改善一贯完成的全栈工程师。个人开发中独立完成了城市本地生活社区平台「Machi」（Web / iOS / Android + 共通 API）与面向日本市场的事业风险诊断服务「Shangence 商衡」（诊断・Stripe 支付・PDF 报告・管理后台）两个产品的企划到公开运营。强项是包含支付、管理后台、法务与安全设计在内、以真实运营为前提的产品开发。",
    ja: "中国出身・日本在住。Web、iOS、Android、バックエンド、データベース、AWS を横断し、課題発見から要件定義、UI/UX設計、実装、デプロイ、運用改善まで一貫して取り組むフルスタック志向のエンジニアです。個人開発では、都市別ローカルライフ・コミュニティプラットフォーム「Machi」（Web / iOS / Android+共通API）と、日本市場向け事業リスク診断サービス「Shangence 商衡」（診断・Stripe決済・PDFレポート・管理画面）の2プロダクトを、企画から公開・運用まで一人で完遂しました。決済、管理画面、法務・安全設計まで含めた、実運用を見据えたプロダクト開発を強みとしています。",
    en: "Born in China, based in Japan. A full-stack engineer working across Web, iOS, Android, backend, databases and AWS — from problem discovery, requirements and UI/UX design to implementation, deployment and operations. As a solo builder I shipped two products end to end: Machi, a city-based local-life community platform (Web / iOS / Android with a shared API), and Shangence, a business-risk assessment service for the Japanese market (assessment, Stripe payments, PDF reports, admin console). My strength is production-grade product development that includes payments, admin tooling, legal pages and safety design."
  } as L,
  stats: {
    zh: [
      ["3", "Clients", "Web / iOS / Android"],
      ["80+", "REST + SSE API", "共通 API 设计"],
      ["2", "Products", "企划〜公开・运营"],
      ["N1", "JLPT", "日本语能力试验"]
    ],
    ja: [
      ["3", "Clients", "Web / iOS / Android"],
      ["80+", "REST + SSE API", "共通API設計"],
      ["2", "Products", "企画〜公開・運用"],
      ["N1", "JLPT", "日本語能力試験"]
    ],
    en: [
      ["3", "Clients", "Web / iOS / Android"],
      ["80+", "REST + SSE APIs", "Shared API design"],
      ["2", "Products", "Planned, shipped, operated"],
      ["N1", "JLPT", "Japanese proficiency"]
    ]
  } as L<string[][]>,
  valueLabel: { zh: "能提供的价值", ja: "提供できる価値", en: "What I bring" } as L,
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
  } as L<string[]>,
  coreLabel: { zh: "核心技能", ja: "コアスキル", en: "Core skills" } as L,
  core: [
    ["Frontend", "Next.js 15 / React 19 / TypeScript / Tailwind CSS"],
    ["Mobile", "SwiftUI / SwiftData / Kotlin / Jetpack Compose"],
    ["Backend", "Python REST API / SSE / Java / Spring Boot"],
    ["Data", "PostgreSQL / Prisma / SQLite / MySQL"],
    ["Cloud", "AWS EC2・S3・CloudFront / Docker / Nginx"],
    ["Business", "Stripe JPY / Admin / Audit Log / Legal"]
  ],
  projectsLabel: { zh: "代表项目", ja: "プロジェクト", en: "Projects" } as L,
  careerLabel: { zh: "职务经历・活动", ja: "職務経験・活動", en: "Work Experience" } as L,
  eduLabel: { zh: "学历", ja: "学歴", en: "Education" } as L,
  langLabel: { zh: "语言", ja: "語学", en: "Languages" } as L,
  skillLabel: { zh: "技术技能", ja: "技術スキル", en: "Skill Matrix" } as L,
  prLabel: { zh: "自我 PR", ja: "自己PR", en: "Personal Statement" } as L,
  prTitle: {
    zh: "发现课题、落成规格、完成公开与运营的能力",
    ja: "課題を見つけ、仕様に落とし込み、公開・運用まで完遂する力",
    en: "Finding problems, specifying them, and carrying them through to launch and operations"
  } as L,
  pr1: {
    zh: "我重视的不是孤立地学习技术，而是把它做成真正被使用的服务。在 Machi 中横跨 Web・iOS・Android・API・AWS 进行设计与实现，在 Shangence 中独立构建了诊断、支付、PDF、管理后台以及法务与安全设计。我完整经历过从需求模糊的阶段整理课题、以 MVP 形式公开、再在运营中持续改善的全过程。",
    ja: "私は、技術を個別に学ぶだけでなく、実際に使われるサービスとして形にすることを重視しています。Machi では Web・iOS・Android・API・AWS を横断して設計・実装し、Shangence では診断、決済、PDF、管理画面、法務・安全設計まで一人で構築しました。要件が曖昧な段階から課題を整理し、MVPとして公開し、運用しながら改善する一連の流れを経験しています。",
    en: "I care less about learning technologies in isolation and more about turning them into services people actually use. For Machi I designed and built across Web, iOS, Android, API and AWS; for Shangence I built everything solo — assessment logic, payments, PDF reports, the admin console, and the legal and safety design. I have been through the full cycle of clarifying vague requirements, shipping an MVP, and improving it in production."
  } as L,
  pr2: {
    zh: "此外，通过 Java 研修讲师、销售与物流现场的经验，我培养了因人而异的讲解能力、遵守标准与安全的姿态以及协作能力。入职后，我会先在 Web 应用开发上稳定输出价值，再发挥能理解后端、移动端与云的优势，为打造被长期使用的产品做出贡献。",
    ja: "また、Java研修講師、販売、物流現場での経験を通じて、相手に合わせて説明する力、標準・安全を守る姿勢、協働する力を培いました。入社後は、Webアプリケーション開発で確実に価値を出しつつ、バックエンド・モバイル・クラウドまで理解できる強みを活かし、長く使われるプロダクトづくりに貢献します。",
    en: "Working as a Java instructor, in retail sales and in logistics taught me to explain things at the listener's level, to respect standards and safety, and to collaborate. After joining, I will deliver value in web application development first, then use my cross-stack understanding of backend, mobile and cloud to help build products that last."
  } as L,
  download: { zh: "下载 PDF 简历（日文）", ja: "職務経歴書 PDF をダウンロード", en: "Download resume PDF (Japanese)" } as L,
  contactCta: { zh: "联系我", ja: "お問い合わせ", en: "Contact me" } as L,
  positionsLabel: { zh: "希望职种", ja: "希望職種", en: "Target roles" } as L,
  positions: {
    zh: ["Web 应用工程师", "前端", "iOS / Android", "全栈", "自社服务开发"],
    ja: ["Webアプリケーションエンジニア", "フロントエンド", "iOS / Android", "フルスタック", "自社サービス開発"],
    en: ["Web Application Engineer", "Frontend", "iOS / Android", "Full-Stack", "In-house Product"]
  } as L<string[]>
};

const projects = [
  {
    name: "Machi",
    nameSub: "",
    badge: { zh: "个人开发・运营中 / Web Beta", ja: "個人開発・運用中 / Web Beta", en: "Solo-built / In operation / Web Beta" } as L,
    tagline: {
      zh: "城市本地生活・社区平台",
      ja: "都市別ローカルライフ・コミュニティプラットフォーム",
      en: "City-based local-life community platform"
    } as L,
    url: "https://machicity.com",
    urlLabel: "machicity.com",
    github: "https://github.com/yaokai4/Machi-Web",
    githubLabel: "Machi-Web / iOS / Android",
    chips: ["Web / iOS / Android", "80+ REST + SSE API", "19 Tables", "AWS S3 + CloudFront"],
    desc: {
      zh: "按国家、城市、语言整理生活信息与用户投稿的城市型本地生活社区平台。将住宅、二手交易、求职、本地服务、店铺优惠、Guide、Q&A、私聊、会员功能统合进同一个城市空间，以东京为起点、面向多城市扩展而设计。不止于 SNS：把「发现 → 看详情 → 咨询 → 沟通 → 预约・购买」连接为一个完整体验。",
      ja: "国・都市・言語ごとに、生活情報とユーザー投稿を整理する都市型ローカルライフ・コミュニティプラットフォーム。住宅、中古品売買、求人、地域サービス、店舗特典、Guide、Q&A、メッセージ、会員機能を一つの都市空間に統合し、東京を起点とした多地域展開を想定して設計。「発見する → 詳細を確認する → 問い合わせる → 相談する → 予約・購入する」までを一つの体験として接続しています。",
      en: "A city-scoped local-life community platform that organizes living information and user posts by country, city and language. Housing, second-hand trade, jobs, local services, store deals, guides, Q&A, messaging and membership live in one city space, designed to expand from Tokyo to multiple regions. It connects the full journey — discover, inspect, inquire, consult, book and purchase — into one experience."
    } as L,
    points: {
      zh: [
        "SNS 型投稿与结构化投稿（二手・租房・求职）在数据模型层分离，提升检索与比较体验",
        "共通 API + MediaDTO / ListingDTO / PostDTO 统一三端数据表现",
        "用户媒体经 S3 + CloudFront + Presigned URL 外部化，应用与分发基盘分离",
        "UI 语言与内容语言分离，为多语言城市的信息发现设计数据结构"
      ],
      ja: [
        "SNS型投稿と構造化投稿（中古品・賃貸・求人）をデータモデルから分離し、検索性と比較性を向上",
        "共通APIと MediaDTO / ListingDTO / PostDTO で Web・iOS・Android のデータ表現を統一",
        "ユーザー投稿メディアを S3 + CloudFront + Presigned URL で外部化し、配信基盤を分離",
        "UI言語とコンテンツ言語を分離し、多言語都市での情報発見を想定したデータ構造を設計"
      ],
      en: [
        "Separated social posts from structured listings (second-hand, rentals, jobs) at the data-model level for better search and comparison",
        "Unified data representation across Web / iOS / Android with a shared API and MediaDTO / ListingDTO / PostDTO",
        "Offloaded user media to S3 + CloudFront with presigned URLs, decoupling the app from the delivery layer",
        "Decoupled UI language from content language for multilingual city discovery"
      ]
    } as L<string[]>,
    tech: "Web: Next.js 15 / React 19 / TS / Tailwind ・ iOS: SwiftUI / SwiftData ・ Android: Kotlin / Compose ・ API: Python REST + SSE ・ DB: SQLite → PostgreSQL ・ Infra: AWS EC2 / S3 / CloudFront / Docker"
  },
  {
    name: "Shangence",
    nameSub: "商衡",
    badge: { zh: "个人开发・运营中", ja: "個人開発・運用中", en: "Solo-built / In operation" } as L,
    tagline: {
      zh: "面向日本市场的事业风险诊断服务",
      ja: "日本市場向け事業リスク診断サービス",
      en: "Business-risk assessment service for the Japanese market"
    } as L,
    url: "https://shangence.com",
    urlLabel: "shangence.com",
    github: "https://github.com/yaokai4/Shangence",
    githubLabel: "Shangence",
    chips: ["7-Step Form", "Rule Engine", "Stripe JPY", "PDF / Admin"],
    desc: {
      zh: "为想在日本创业的个人、小规模事业者与海外事业者整理事业风险、初期费用、验证方法、撤退基准、许认可与法务注意点的诊断服务。设计了登录前免费诊断 → 确认结果后注册会员 → 保存诊断 → 购买付费详细报告 → PDF 下载 → 履历管理的商用转化链路。AI 仅用于辅助生成说明文，风险评分由规则引擎计算。",
      ja: "日本で事業を始めたい個人・小規模事業者・海外事業者向けに、事業リスク、初期費用、検証方法、撤退基準、許認可・法務上の注意点を整理する診断サービス。ログイン前に無料診断を開始でき、結果確認後に会員登録、診断保存、有料詳細レポート購入、PDFダウンロード、履歴管理へ進む商用導線を設計。AIは説明文の補助生成に限定し、リスクスコアはルールエンジンで算出します。",
      en: "An assessment service that maps business risk, startup costs, validation methods, exit criteria, licensing and legal considerations for individuals, small businesses and overseas founders entering Japan. The commercial funnel runs from a no-login free assessment to sign-up, saved results, paid detailed reports, PDF download and history. AI is limited to auxiliary explanations — risk scores come from a rule engine."
    } as L,
    points: {
      zh: [
        "设计「免费诊断 → 免费结果 → 注册 → 付费报告 → PDF → 履历管理」转化链路",
        "诊断逻辑与说明生成分离，评分由规则引擎计算，保证可复现与透明",
        "诊断、订单、权限、退款、审计日志同一数据模型，管理后台可直接运营",
        "法务・退款・数据删除・安全表达全部纳入实现范围，达到日本市场可公开水准"
      ],
      ja: [
        "「無料診断 → 無料結果 → 会員登録 → 有料レポート → PDF → 履歴管理」というコンバージョン導線を設計",
        "診断ロジックを説明生成から分離し、スコアはルールエンジンで算出（再現性・透明性）",
        "診断、注文、権限、返金、監査ログを同一データモデルで管理し、管理画面から運用可能に",
        "法務・返金・データ削除・安全表現まで実装対象に含め、日本市場で公開可能な品質で構築"
      ],
      en: [
        "Designed the conversion funnel: free assessment → free result → sign-up → paid report → PDF → history",
        "Separated scoring from explanation generation; scores come from a rule engine for reproducibility and transparency",
        "Assessments, orders, permissions, refunds and audit logs share one data model, operable from the admin console",
        "Included legal pages, refunds, data deletion and safety wording in scope — built to a publishable standard for Japan"
      ]
    } as L<string[]>,
    tech: "Next.js App Router / TypeScript / Tailwind ・ React Hook Form / Zod ・ Prisma 7 / PostgreSQL ・ Stripe JPY ・ Vitest / ESLint ・ Session Auth / Masking / Legal Pages"
  }
];

const career = [
  {
    org: { zh: "Amazon Japan G.K.", ja: "Amazon Japan G.K.", en: "Amazon Japan G.K." } as L,
    role: { zh: "契约社员（配送站）", ja: "契約社員（デリバリーステーション）", en: "Contract Associate (Delivery Station)" } as L,
    period: { zh: "2025.05 − 至今", ja: "2025.05 − 現在", en: "2025.05 − present" } as L,
    desc: {
      zh: "从事配送站运营业务，重视标准作业、安全、品质与时间管理，与成员协作完成日常业务。工作之余持续开发与运营 Machi / Shangence。",
      ja: "デリバリーステーションのオペレーション業務に従事。標準作業・安全・品質・時間管理を徹底し、メンバーと連携して日々の業務を遂行。業務と並行して Machi / Shangence の開発・運用を継続。",
      en: "Operations at a delivery station with a focus on standard work, safety, quality and time management. Building and operating Machi / Shangence in parallel."
    } as L
  },
  {
    org: { zh: "株式会社 BicCamera", ja: "株式会社ビックカメラ", en: "BicCamera Inc." } as L,
    role: { zh: "PC 销售・免税对应", ja: "PC販売・免税対応", en: "PC Sales / Tax-free Support" } as L,
    period: { zh: "2022.04 − 2024.10", ja: "2022.04 − 2024.10", en: "2022.04 − 2024.10" } as L,
    desc: {
      zh: "以日语、中文负责 PC 与周边设备的提案式销售、产品说明与免税对应。实践从需求倾听到提案的接客方式，并为新人与外国员工整备业务手顺书。",
      ja: "PC・周辺機器の提案販売、製品説明、免税対応を日本語・中国語で担当。要望のヒアリングから提案につなげる接客を実践し、新人・外国人スタッフ向けの業務手順書も整備。",
      en: "Consultative sales of PCs and peripherals in Japanese and Chinese, including tax-free support. Practiced needs-based selling and wrote work manuals for new and international staff."
    } as L
  },
  {
    org: { zh: "株式会社 ASUIT", ja: "株式会社ASUIT", en: "ASUIT Inc." } as L,
    role: { zh: "Java 讲师（研修讲师）", ja: "Javaインストラクター（研修講師）", en: "Java Instructor" } as L,
    period: { zh: "约 8 周（集中研修）", ja: "約8週間（集中研修）", en: "~8 weeks (intensive)" } as L,
    desc: {
      zh: "面向 IT 工程师志愿者讲授 Java Web 应用开发。以实务为导向讲解 Spring MVC / Spring Boot、职责分离、DI、CRUD、DB・API 联动，并提供代码评审、课题设计与错误排查支援。",
      ja: "ITエンジニア志望者に Java による Web アプリケーション開発を指導。Spring MVC / Spring Boot、責務分離、DI、CRUD、DB・API連携を実務志向で指導し、コードレビュー、課題設計、エラー調査を支援。",
      en: "Taught Java web application development to aspiring engineers: Spring MVC / Spring Boot, separation of concerns, DI, CRUD, DB / API integration — plus code review, assignment design and debugging support."
    } as L
  },
  {
    org: { zh: "东京2020大会", ja: "東京2020大会", en: "Tokyo 2020 Games" } as L,
    role: { zh: "会场志愿者", ja: "会場ボランティア", en: "Venue Volunteer" } as L,
    period: { zh: "大会期间", ja: "大会期間中", en: "During the Games" } as L,
    desc: {
      zh: "负责会场与巴士乘车点的来场者引导。以日中英三语进行指引，冷静应对突发拥挤与指引变更。",
      ja: "会場・バス乗り場での来場者誘導を担当。日本語・中国語・英語で案内し、突発的な混雑や案内変更にも冷静に対応。",
      en: "Guided visitors at venues and bus stops in Japanese, Chinese and English, staying calm through sudden crowding and route changes."
    } as L
  }
];

const education = [
  {
    school: { zh: "开智国际大学｜国际教养学部", ja: "開智国際大学｜国際教養学部 国際教養学科", en: "Kaichi International University — Liberal Arts" } as L,
    period: { zh: "2022 − 2026.09（预计毕业）", ja: "2022 − 2026.09（卒業見込み）", en: "2022 − 2026.09 (expected)" } as L,
    note: {
      zh: "学习国际关系学、异文化交流、经营学与市场营销理论。",
      ja: "国際関係学、異文化コミュニケーション、経営学、マーケティング理論を学習。",
      en: "International relations, cross-cultural communication, management and marketing."
    } as L
  },
  {
    school: { zh: "Human Academy 日本语学校", ja: "ヒューマンアカデミー日本語学校", en: "Human Academy Japanese Language School" } as L,
    period: { zh: "2019.10 − 2022.03（毕业）", ja: "2019.10 − 2022.03（卒業）", en: "2019.10 − 2022.03 (graduated)" } as L,
    note: {
      zh: "日本语综合、EJU、JLPT 对策、日本文化理解。",
      ja: "日本語総合、EJU、JLPT対策、日本文化理解。",
      en: "Comprehensive Japanese, EJU / JLPT preparation, Japanese culture."
    } as L
  },
  {
    school: { zh: "湖南科技职业学院（中国）｜软件技术", ja: "湖南科技職業学院（中国）｜ソフトウェア技術", en: "Hunan Vocational College of Science and Technology — Software Engineering" } as L,
    period: { zh: "2015 − 2020（毕业）", ja: "2015 − 2020（卒業）", en: "2015 − 2020 (graduated)" } as L,
    note: {
      zh: "学习软件开发、Java、Spring Boot、数据库、Web 开发与系统设计・运维。",
      ja: "ソフトウェア開発、Java、Spring Boot、データベース、Web開発、システム設計・運用を学習。",
      en: "Software development, Java, Spring Boot, databases, web development, systems design and operations."
    } as L
  }
];

const languages = [
  { name: { zh: "中文", ja: "中国語", en: "Chinese" } as L, note: { zh: "母语", ja: "ネイティブ", en: "Native" } as L },
  {
    name: { zh: "日语", ja: "日本語", en: "Japanese" } as L,
    note: { zh: "JLPT N1。接客与研修讲师的实务使用经验。", ja: "JLPT N1。接客・研修講師での実務使用経験。", en: "JLPT N1, used professionally in customer service and teaching." } as L
  },
  {
    name: { zh: "英语", ja: "英語", en: "English" } as L,
    note: { zh: "技术文档阅读・日常交流。", ja: "技術文書読解・日常コミュニケーション。", en: "Technical reading and daily communication." } as L
  }
];

const skillMatrix = [
  {
    area: "Frontend",
    tech: "Next.js / React / TypeScript / JavaScript / Vue.js",
    exp: { zh: "App Router、UI 设计、表单、API 联动、SEO、管理后台", ja: "App Router、UI設計、フォーム、API連携、SEO、管理画面", en: "App Router, UI design, forms, API integration, SEO, admin" } as L
  },
  {
    area: "Mobile",
    tech: "Swift / SwiftUI / SwiftData / Kotlin / Jetpack Compose",
    exp: { zh: "认证、投稿、列表・详情、个人资料、媒体展示、共通 API", ja: "認証、投稿、一覧・詳細、プロフィール、メディア表示、共通API連携", en: "Auth, posting, list/detail, profile, media, shared API" } as L
  },
  {
    area: "Backend",
    tech: "Python / REST API / SSE / Java / Spring Boot / MyBatis",
    exp: { zh: "认证、投稿、通知、DM、管理 API、文件上传、研修指导", ja: "認証、投稿、通知、DM、管理API、ファイルアップロード、研修指導", en: "Auth, posts, notifications, DM, admin API, file upload, teaching" } as L
  },
  {
    area: "Database",
    tech: "PostgreSQL / SQLite / MySQL / Prisma",
    exp: { zh: "Schema・索引设计、审计日志、迁移设计、游标分页", ja: "スキーマ・インデックス設計、監査ログ、移行設計、カーソルページング", en: "Schema & index design, audit logs, migrations, cursor pagination" } as L
  },
  {
    area: "Cloud",
    tech: "AWS EC2 / S3 / CloudFront / IAM / Nginx / Docker",
    exp: { zh: "部署、SSL、CDN、Presigned URL、媒体外部化、服务器运维", ja: "デプロイ、SSL、CDN、Presigned URL、メディア外部化、サーバー運用", en: "Deployment, SSL, CDN, presigned URLs, media offloading, server ops" } as L
  },
  {
    area: "Product",
    tech: "Stripe JPY / PDF / Admin / Audit Log / Legal",
    exp: { zh: "支付、订单・退款、报告、权限、利用规约・免责・安全设计", ja: "決済、注文・返金、レポート、権限、利用規約・免責・安全設計", en: "Payments, orders & refunds, reports, permissions, terms & safety" } as L
  }
];

/* ---------- presentational helpers ---------- */

function SectionHead({ jp, en }: { jp: string; en: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-black tracking-wide text-indigo-900 md:text-3xl">{jp}</h2>
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-500">{en}</span>
      </div>
      <div className="mt-3 h-0.5 w-full" style={{ background: "linear-gradient(to right, #0F2D4E 0, #0F2D4E 44px, #E7EEF5 44px, #E7EEF5 100%)" }} />
    </div>
  );
}

export default async function AboutPage() {
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const copy = applyCopyOverrides(t, copyOverrides, "about");
  const pick = <T,>(field: L<T>): T => field[locale];

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="section-container relative pt-32 md:pt-36">
        <div className="flex items-baseline justify-between gap-4">
          <Badge>{pick(copy.eyebrow)}</Badge>
          <span className="text-xs font-semibold tracking-wide text-slate-500">{pick(copy.asOf)}</span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="flex items-end gap-5">
              <h1 className="font-serif text-5xl font-semibold tracking-[0.18em] text-indigo-900 md:text-6xl">姚 凱</h1>
              <span className="pb-1.5 text-sm font-bold uppercase tracking-[0.4em] text-sky-500">Yao Kai</span>
            </div>
            <p className="mt-5 text-xl font-black tracking-wide text-slate-900 md:text-2xl">{pick(copy.title)}</p>
            <p className="mt-2 text-sm tracking-wider text-slate-500">{pick(copy.subtitle)}</p>

            <p className="mt-7 max-w-2xl text-[15px] leading-8 text-slate-600">{pick(copy.summary)}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={RESUME_PDF}
                download="職務経歴書_姚凱.pdf"
                className="magnetic-button inline-flex h-11 items-center gap-2 rounded-full border border-indigo-900 bg-indigo-900 px-5 text-sm font-bold text-white shadow-[0_1px_2px_rgba(15,45,78,0.04)] transition hover:-translate-y-0.5 hover:bg-indigo-800 focus-ring"
              >
                <Download className="h-4 w-4" />
                {pick(copy.download)}
              </a>
              <a
                href="https://github.com/yaokai4"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#DAE2EA] bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white focus-ring"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <Link
                href={withLocalePath("/contact", locale)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent px-4 text-sm font-bold text-slate-700 transition hover:bg-white focus-ring"
              >
                {pick(copy.contactCta)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* contact / photo card */}
          <aside className="premium-glass-card h-fit rounded-md p-6">
            <div className="flex items-start gap-5">
              <div className="relative h-36 w-[108px] shrink-0 overflow-hidden rounded-md border border-indigo-200/70 shadow-[0_4px_14px_rgba(15,45,78,0.18)]">
                <Image src="/images/yaokai-portrait.jpg" alt="姚凱" fill className="object-cover" sizes="108px" priority />
              </div>
              <dl className="grid content-start gap-2.5 text-sm">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-500">Email</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">hi@yaokai.me</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-500">Web / GitHub</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">yaokai.me ・ github.com/yaokai4</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-500">Products</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">machicity.com ・ shangence.com</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-500">Language</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">日本語 JLPT N1 ・ 中国語 ・ 英語</dd>
                </div>
              </dl>
            </div>
            <div className="mt-5 border-t border-indigo-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-500">{pick(copy.positionsLabel)}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {pick(copy.positions).map((p) => (
                  <span key={p} className="rounded-full border border-indigo-200/80 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-800">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* stat band */}
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {pick(copy.stats).map(([num, lab, jp]) => (
            <div key={lab} className="rounded-md border border-indigo-100 bg-indigo-50/60 px-4 py-5 text-center">
              <div className="text-3xl font-black tracking-tight text-indigo-900">{num}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">{lab}</div>
              <div className="mt-0.5 text-xs text-slate-500">{jp}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- value & core skills ---------- */}
      <section className="section-container grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHead jp={pick(copy.valueLabel)} en="Value" />
          <ul className="grid gap-3">
            {pick(copy.values).map((v) => (
              <li key={v} className="flex gap-3 text-[15px] leading-7 text-slate-700">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-sky-500" />
                {v}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHead jp={pick(copy.coreLabel)} en="Core Skills" />
          <dl className="grid gap-2.5">
            {copy.core.map(([lab, val]) => (
              <div key={lab} className="flex items-baseline gap-4">
                <dt className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-600">{lab}</dt>
                <dd className="text-sm font-semibold leading-6 text-slate-800">{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- projects ---------- */}
      <section className="section-container py-4">
        <SectionHead jp={pick(copy.projectsLabel)} en="Projects" />
        <div className="grid gap-6">
          {projects.map((p) => (
            <article key={p.name} className="premium-glass-card rounded-md p-7 md:p-9">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-indigo-900">
                    {p.name}
                    {p.nameSub ? <span className="ml-2 text-xl font-bold text-sky-600">{p.nameSub}</span> : null}
                  </h3>
                  <p className="mt-1.5 text-sm font-semibold text-slate-700">{pick(p.tagline)}</p>
                  <p className="mt-1 text-xs tracking-wide text-slate-500">
                    <a href={p.url} target="_blank" rel="noreferrer" className="font-bold text-sky-600 hover:text-indigo-900">
                      {p.urlLabel}
                    </a>
                    <span className="mx-2 text-slate-300">|</span>
                    <a href={p.github} target="_blank" rel="noreferrer" className="hover:text-indigo-900">
                      GitHub: {p.githubLabel}
                    </a>
                  </p>
                </div>
                <span className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-bold text-indigo-800">
                  {pick(p.badge)}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {p.chips.map((c) => (
                  <span key={c} className="rounded-full border border-indigo-200/70 bg-white px-3 py-1 text-xs font-semibold text-indigo-800">
                    {c}
                  </span>
                ))}
              </div>

              <p className="mt-5 max-w-4xl text-[15px] leading-8 text-slate-600">{pick(p.desc)}</p>

              <ul className="mt-5 grid gap-2.5 md:grid-cols-2">
                {pick(p.points).map((pt) => (
                  <li key={pt} className="flex gap-3 text-sm leading-7 text-slate-700">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-sky-500" />
                    {pt}
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-indigo-100 pt-4 text-xs leading-6 tracking-wide text-slate-500">{p.tech}</p>

              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-800 transition hover:gap-2.5 hover:text-indigo-900"
              >
                {locale === "ja" ? "サービスを見る" : locale === "en" ? "Visit service" : "访问服务"}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- career & education ---------- */}
      <section className="section-container grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionHead jp={pick(copy.careerLabel)} en="Work Experience" />
          <div className="grid gap-5">
            {career.map((c) => (
              <article key={c.org.ja} className="border-l-2 border-indigo-100 pl-5 transition hover:border-indigo-900">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-black text-indigo-900">
                    {pick(c.org)}
                    <span className="ml-2 text-sm font-semibold text-sky-600">{pick(c.role)}</span>
                  </h3>
                  <span className="text-xs font-bold tracking-wider text-slate-500">{pick(c.period)}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{pick(c.desc)}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-10">
          <div>
            <SectionHead jp={pick(copy.eduLabel)} en="Education" />
            <div className="grid gap-4">
              {education.map((e) => (
                <div key={e.school.ja}>
                  <p className="text-xs font-bold tracking-wider text-sky-600">{pick(e.period)}</p>
                  <h3 className="mt-0.5 text-sm font-black text-indigo-900">{pick(e.school)}</h3>
                  <p className="mt-1 text-xs leading-6 text-slate-500">{pick(e.note)}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHead jp={pick(copy.langLabel)} en="Languages" />
            <div className="grid gap-3">
              {languages.map((l) => (
                <div key={l.name.ja} className="flex items-baseline gap-4">
                  <span className="w-14 shrink-0 text-sm font-black text-indigo-900">{pick(l.name)}</span>
                  <span className="text-sm leading-6 text-slate-600">{pick(l.note)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- skill matrix ---------- */}
      <section className="section-container py-4">
        <SectionHead jp={pick(copy.skillLabel)} en="Skill Matrix" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-indigo-900">
                <th className="w-28 px-3 pb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">{locale === "ja" ? "領域" : locale === "en" ? "Area" : "领域"}</th>
                <th className="w-[42%] px-3 pb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">{locale === "ja" ? "主要技術" : locale === "en" ? "Technologies" : "主要技术"}</th>
                <th className="px-3 pb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">{locale === "ja" ? "実装経験" : locale === "en" ? "Experience" : "实装经验"}</th>
              </tr>
            </thead>
            <tbody>
              {skillMatrix.map((row) => (
                <tr key={row.area} className="border-b border-indigo-100/80 last:border-b-0">
                  <td className="px-3 py-3.5 text-sm font-black text-indigo-900">{row.area}</td>
                  <td className="px-3 py-3.5 text-sm font-semibold text-slate-800">{row.tech}</td>
                  <td className="px-3 py-3.5 text-sm text-slate-500">{pick(row.exp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- self PR + CTA ---------- */}
      <section className="section-container py-16">
        <div className="premium-glass-card rounded-md p-8 md:p-10">
          <SectionHead jp={pick(copy.prLabel)} en="Self PR" />
          <h3 className="text-lg font-black leading-snug text-indigo-900 md:text-xl">{pick(copy.prTitle)}</h3>
          <p className="mt-4 max-w-4xl text-[15px] leading-8 text-slate-600">{pick(copy.pr1)}</p>
          <p className="mt-3 max-w-4xl text-[15px] leading-8 text-slate-600">{pick(copy.pr2)}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-indigo-100 pt-6">
            <a
              href={RESUME_PDF}
              download="職務経歴書_姚凱.pdf"
              className="magnetic-button inline-flex h-11 items-center gap-2 rounded-full border border-indigo-900 bg-indigo-900 px-5 text-sm font-bold text-white shadow-[0_1px_2px_rgba(15,45,78,0.04)] transition hover:-translate-y-0.5 hover:bg-indigo-800 focus-ring"
            >
              <Download className="h-4 w-4" />
              {pick(copy.download)}
            </a>
            <a
              href="mailto:hi@yaokai.me"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#DAE2EA] bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white focus-ring"
            >
              <Mail className="h-4 w-4" />
              hi@yaokai.me
            </a>
            <a
              href="https://machicity.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent px-4 text-sm font-bold text-slate-700 transition hover:bg-white focus-ring"
            >
              <Globe className="h-4 w-4" />
              machicity.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
