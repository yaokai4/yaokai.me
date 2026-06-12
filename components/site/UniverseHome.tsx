"use client";

import { ArrowRight, ArrowUpRight, ExternalLink, Github, Mail, PenLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { withLocalePath, type Locale } from "@/lib/i18n";

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
  articles: Article[];
  nowItems: NowItem[];
};

const copy = {
  zh: {
    eyebrow: "个人开发 / 两个在线产品",
    heroTitle: "姚凯 / Yaokai",
    heroSubtitle: "Machi 和 Shangence 商衡的开发者",
    heroLead:
      "我独立开发并运营着两个产品：城市生活社区 Machi（Web / iOS / Android 三端共用一套 API），和面向日本市场的事业风险诊断服务 Shangence 商衡（诊断、Stripe 支付、PDF 报告、管理后台）。从需求、设计、代码到部署和运维，每一层都是我自己做的——这个网站也不例外。",
    chips: ["Next.js / React", "SwiftUI", "Kotlin / Compose", "Python API", "PostgreSQL", "AWS"],
    stats: [["2", "在线产品"], ["5", "公开仓库"], ["3", "Machi 客户端"]],
    workCta: "看作品",
    resumeCta: "看简历",
    runningLabel: "正在运营",
    running: [
      ["Machi", "城市生活社区 · Web Beta 公开中", "https://machicity.com", "machicity.com"],
      ["Shangence 商衡", "事业风险诊断 · 运营中", "https://machicity.life/ja", "machicity.life/ja"]
    ],
    runningNote: "本站代码公开在 GitHub",
    proofEyebrow: "可验证信号",
    proofTitle: "不是只会写页面，而是能把产品跑起来。",
    proofLead: "如果你在评估我是否能独立交付，下面这些是最直接的证据。",
    proofItems: [
      ["三端产品", "Machi 的 Web、iOS、Android 共用一套 API 和内容模型。"],
      ["商用闭环", "Shangence 包含诊断、Stripe 日元支付、PDF 报告和后台审核。"],
      ["上线运维", "AWS / Nginx / systemd / 证书 / 备份 / 部署脚本都自己维护。"],
      ["内容系统", "本站自带三语内容、搜索、SEO、管理后台和安全入口。"]
    ],
    projectsEyebrow: "作品",
    projectsTitle: "先看这三个核心入口。",
    projectsLead: "Machi 和 Shangence 是我独立做的两个产品；yaokai.me 是这个网站和后台。Machi 的 Web / iOS / Android 代码会在作品页拆开看。",
    visitLabel: "访问",
    scopeEyebrow: "能力范围",
    scopeTitle: "一个人，从想法到上线。",
    scopeItems: [
      ["企画与需求", "和真实用户聊，把模糊的想法写成能开工的规格。"],
      ["三端实现", "Next.js 写 Web，SwiftUI 写 iOS，Kotlin 写 Android，共用一套 API。"],
      ["后端与数据", "Python 接口、PostgreSQL / SQLite、鉴权、通知、媒体上传。"],
      ["部署与运维", "AWS、Nginx、systemd、域名证书，出了问题自己排查。"],
      ["商用配套", "Stripe 支付、管理后台、审计日志、法务页面。"]
    ],
    writingEyebrow: "文章",
    writingTitle: "开发笔记，想到什么写什么。",
    writingLead: "踩过的坑、做产品时的取舍，偶尔也写写在日本求职的事。",
    readArticle: "阅读全文",
    allArticles: "全部文章",
    nowEyebrow: "近况",
    nowTitle: "最近在做",
    nowFallback: [
      ["Machi App 上架", "iOS / Android 客户端正在准备 App Store 与 Google Play 上架。", "进行中", "Build", 80],
      ["找工作", "在日本找 Web / 全栈方向的工作，完整简历在「关于」页。", "进行中", "Career", 60],
      ["写文章", "把这两年开发里值得记的东西慢慢整理成文。", "刚开始", "Write", 20]
    ],
    ctaTitle: "想一起做点什么，或者在找一个能独立交付的工程师？",
    ctaLead: "邮件最快。看完作品再来聊也完全可以。",
    ctaButton: "联系我"
  },
  ja: {
    eyebrow: "個人開発 / 運用中のプロダクト2つ",
    heroTitle: "姚凯 / Yaokai",
    heroSubtitle: "Machi と Shangence 商衡の開発者",
    heroLead:
      "都市生活コミュニティ「Machi」（Web / iOS / Android、共通API）と、日本市場向け事業リスク診断「Shangence 商衡」（診断・Stripe決済・PDFレポート・管理画面）を、一人で開発・運用しています。要件整理からデザイン、実装、デプロイ、運用まで全部自分でやります。このサイトもそうです。",
    chips: ["Next.js / React", "SwiftUI", "Kotlin / Compose", "Python API", "PostgreSQL", "AWS"],
    stats: [["2", "運用中プロダクト"], ["5", "公開リポジトリ"], ["3", "Machi クライアント"]],
    workCta: "制作実績を見る",
    resumeCta: "経歴を見る",
    runningLabel: "運用中",
    running: [
      ["Machi", "都市生活コミュニティ · Web Beta 公開中", "https://machicity.com", "machicity.com"],
      ["Shangence 商衡", "事業リスク診断 · 運用中", "https://machicity.life/ja", "machicity.life/ja"]
    ],
    runningNote: "このサイトのコードは GitHub で公開",
    proofEyebrow: "検証できる実績",
    proofTitle: "画面を作るだけでなく、プロダクトを動かし続けます。",
    proofLead: "一人でどこまで任せられるかを見るなら、ここが一番わかりやすい証拠です。",
    proofItems: [
      ["3クライアント", "Machi の Web、iOS、Android は共通 API とコンテンツモデルを利用。"],
      ["商用導線", "Shangence は診断、Stripe円決済、PDFレポート、管理画面まで実装。"],
      ["公開と運用", "AWS / Nginx / systemd / 証明書 / バックアップ / デプロイを自分で管理。"],
      ["CMS と SEO", "このサイトは3言語、検索、SEO、管理画面、セキュア入口を内蔵。"]
    ],
    projectsEyebrow: "制作実績",
    projectsTitle: "まずは、この3つを見てください。",
    projectsLead: "Machi と Shangence は一人で作った2つのプロダクトです。yaokai.me はこのサイトと管理画面。Machi の Web / iOS / Android は制作実績ページで分けて見られます。",
    visitLabel: "見る",
    scopeEyebrow: "担当範囲",
    scopeTitle: "一人で、アイデアから公開まで。",
    scopeItems: [
      ["企画と要件", "実際のユーザーと話し、曖昧なアイデアを着手できる仕様に落とす。"],
      ["3クライアント実装", "Web は Next.js、iOS は SwiftUI、Android は Kotlin。APIは共通。"],
      ["バックエンドとデータ", "Python API、PostgreSQL / SQLite、認証、通知、メディアアップロード。"],
      ["デプロイと運用", "AWS、Nginx、systemd、ドメインと証明書。障害も自分で調べる。"],
      ["商用まわり", "Stripe 決済、管理画面、監査ログ、法務ページ。"]
    ],
    writingEyebrow: "記事",
    writingTitle: "開発メモ。思いついたら書きます。",
    writingLead: "ハマったこと、プロダクトの判断、日本での就活のことも。",
    readArticle: "続きを読む",
    allArticles: "記事一覧",
    nowEyebrow: "近況",
    nowTitle: "いま取り組んでいること",
    nowFallback: [
      ["Machi アプリ公開", "iOS / Android クライアントの App Store / Google Play 公開を準備中。", "進行中", "Build", 80],
      ["就職活動", "日本で Web / フルスタックの仕事を探しています。経歴はプロフィールページへ。", "進行中", "Career", 60],
      ["記事を書く", "この2年の開発で残しておきたいことを少しずつ文章に。", "始めたばかり", "Write", 20]
    ],
    ctaTitle: "一緒に何か作りたい方、最後まで自走できるエンジニアを探している方へ。",
    ctaLead: "メールが一番早いです。作品を見てからでも、お気軽にどうぞ。",
    ctaButton: "連絡する"
  },
  en: {
    eyebrow: "Solo developer / two products in production",
    heroTitle: "Yaokai",
    heroSubtitle: "Builder of Machi and Shangence",
    heroLead:
      "I build and run two products on my own: Machi, a city-life community platform (Web / iOS / Android sharing one API), and Shangence, a business-risk assessment service for the Japanese market (assessment, Stripe payments, PDF reports, admin console). Requirements, design, code, deployment, operations — every layer is mine. Including this site.",
    chips: ["Next.js / React", "SwiftUI", "Kotlin / Compose", "Python API", "PostgreSQL", "AWS"],
    stats: [["2", "live products"], ["5", "public repos"], ["3", "Machi clients"]],
    workCta: "See the work",
    resumeCta: "Resume",
    runningLabel: "In production",
    running: [
      ["Machi", "City-life community · Web beta live", "https://machicity.com", "machicity.com"],
      ["Shangence", "Business-risk assessment · live", "https://machicity.life/ja", "machicity.life/ja"]
    ],
    runningNote: "This site is open source on GitHub",
    proofEyebrow: "Verifiable Signals",
    proofTitle: "Not just screens — products that run in production.",
    proofLead: "If you are evaluating whether I can ship independently, these are the clearest signals.",
    proofItems: [
      ["Three clients", "Machi's Web, iOS and Android clients share one API and content model."],
      ["Commercial loop", "Shangence includes assessment, Stripe JPY payments, PDF reports and admin review."],
      ["Operations", "AWS, Nginx, systemd, certificates, backups and deploy scripts are maintained by me."],
      ["Content system", "This site includes trilingual content, search, SEO, admin tooling and secure entry."]
    ],
    projectsEyebrow: "Work",
    projectsTitle: "Start with these three.",
    projectsLead: "Machi and Shangence are the two products I build solo. yaokai.me is this site and CMS. The work page breaks Machi into its Web / iOS / Android repositories.",
    visitLabel: "Visit",
    scopeEyebrow: "Scope",
    scopeTitle: "One person, from idea to production.",
    scopeItems: [
      ["Product & requirements", "Talk to real users, turn vague ideas into specs you can build from."],
      ["Three clients", "Next.js for web, SwiftUI for iOS, Kotlin for Android — one shared API."],
      ["Backend & data", "Python APIs, PostgreSQL / SQLite, auth, notifications, media uploads."],
      ["Deployment & ops", "AWS, Nginx, systemd, domains and certificates. I debug my own outages."],
      ["Business plumbing", "Stripe payments, admin consoles, audit logs, legal pages."]
    ],
    writingEyebrow: "Writing",
    writingTitle: "Development notes, written as they come.",
    writingLead: "Things I got stuck on, product trade-offs, and sometimes the job hunt in Japan.",
    readArticle: "Read more",
    allArticles: "All posts",
    nowEyebrow: "Now",
    nowTitle: "What I am working on",
    nowFallback: [
      ["Machi app release", "Preparing the iOS / Android clients for App Store and Google Play.", "In progress", "Build", 80],
      ["Job hunting", "Looking for web / full-stack roles in Japan. Full resume on the about page.", "In progress", "Career", 60],
      ["Writing", "Slowly turning two years of building into posts.", "Just started", "Write", 20]
    ],
    ctaTitle: "Want to build something — or hiring an engineer who ships end to end?",
    ctaLead: "Email is fastest. Browsing the work first is perfectly fine too.",
    ctaButton: "Contact me"
  }
} as const;

const projectCards = [
  {
    name: "Machi",
    url: "https://machicity.com",
    urlLabel: "machicity.com",
    github: "https://github.com/yaokai4/Machi-Web",
    status: { zh: "Web Beta 公开中", ja: "Web Beta 公開中", en: "Web beta live" },
    desc: {
      zh: "把一个城市的租房、二手、求职、本地服务和社区讨论放进同一个产品。Web、iOS、Android 三端，共用 80 多个 REST + SSE 接口，媒体走 S3 + CloudFront。",
      ja: "住まい、中古品、求人、地域サービス、コミュニティを一つの都市空間に。Web / iOS / Android の3クライアントが80本以上の REST + SSE API を共有し、メディアは S3 + CloudFront で配信。",
      en: "Housing, second-hand, jobs, local services and community in one city space. Three clients — Web, iOS, Android — share 80+ REST + SSE endpoints, with media on S3 + CloudFront."
    },
    did: {
      zh: "一个人完成：产品设计、三端实现、后端、数据库、AWS 部署。",
      ja: "企画、3クライアント実装、バックエンド、DB、AWS 構築まで一人で担当。",
      en: "Solo: product design, all three clients, backend, database, AWS."
    },
    tech: "Next.js 15 · SwiftUI · Kotlin / Compose · Python · SQLite → PostgreSQL · AWS"
  },
  {
    name: "Shangence 商衡",
    url: "https://machicity.life/ja",
    urlLabel: "machicity.life/ja",
    github: "https://github.com/yaokai4/Shangence",
    status: { zh: "运营中", ja: "運用中", en: "Live" },
    desc: {
      zh: "帮想在日本创业的人算清楚风险：7 步诊断、规则引擎评分、付费详细报告（Stripe 日元支付 + PDF）、后台审核与退款。法务页面和敏感信息脱敏也都做了。",
      ja: "日本で事業を始める人のリスクを整理するサービス。7ステップ診断、ルールエンジンのスコア、有料レポート（Stripe JPY + PDF）、管理画面での審査・返金まで。法務ページや個人情報マスキングも実装済み。",
      en: "Helps people starting a business in Japan see their risk clearly: a 7-step assessment, rule-engine scoring, paid reports (Stripe JPY + PDF), admin review and refunds. Legal pages and PII masking included."
    },
    did: {
      zh: "从商业设计到法务合规，完整的商用闭环。",
      ja: "事業設計から法務対応まで、商用サービスに必要な一式。",
      en: "The full commercial loop, from business design to legal compliance."
    },
    tech: "Next.js App Router · React Hook Form / Zod · Prisma 7 / PostgreSQL · Stripe JPY · Vitest"
  },
  {
    name: "yaokai.me",
    url: "https://yaokai.me",
    urlLabel: "yaokai.me",
    github: "https://github.com/yaokai4/yaokai.me",
    status: { zh: "就是本站", ja: "このサイト", en: "This site" },
    desc: {
      zh: "你正在看的这个网站。Next.js 16 + Prisma，中日英三语，自带文章后台，部署在东京的 Lightsail 上。",
      ja: "いま見ているこのサイト。Next.js 16 + Prisma、3言語対応、記事の管理画面付き。東京の Lightsail で稼働。",
      en: "The site you are reading. Next.js 16 + Prisma, three languages, its own writing admin, deployed on Lightsail in Tokyo."
    },
    did: {
      zh: "把简历的排版系统搬到了 Web 上，代码公开。",
      ja: "職務経歴書のデザインシステムを Web に移植。コードは公開。",
      en: "The resume's design system, ported to the web. Open source."
    },
    tech: "Next.js 16 · Prisma · Tailwind CSS · i18n (zh / ja / en) · Lightsail"
  }
];

export function UniverseHome({ locale, articles, nowItems }: UniverseHomeProps) {
  const t = copy[locale];
  const selectedArticles = articles.filter((item) => item.featured).concat(articles.filter((item) => !item.featured)).slice(0, 3);
  const visibleNow = nowItems.length
    ? nowItems.slice(0, 3)
    : t.nowFallback.map(([title, description, status, type, progress], index) => ({
        id: `fallback-${index}`,
        title: String(title),
        description: String(description),
        status: String(status),
        type: String(type),
        progress: Number(progress)
      }));

  return (
    <div className="relative overflow-hidden pb-8">
      {/* hero */}
      <section className="wide-container relative grid gap-10 pb-14 pt-32 md:pb-20 md:pt-36 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="min-w-0">
          <p className="editorial-label mb-5">{t.eyebrow}</p>
          <h1 className="hero-copy font-serif text-5xl font-semibold leading-[1.05] tracking-[0.06em] text-indigo-950 sm:text-6xl md:text-7xl">
            {t.heroTitle}
          </h1>
          <p className="mt-6 text-lg font-bold leading-8 text-slate-800 sm:text-xl md:text-2xl">{t.heroSubtitle}</p>
          <div className="editorial-bar mt-6 w-full max-w-xl" />
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg md:leading-9">{t.heroLead}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {t.chips.map((tag) => (
              <span key={tag} className="max-w-full rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-800">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {t.stats.map(([value, label]) => (
              <div key={label} className="rounded-md border border-[#DAE2EA] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,45,78,0.04)]">
                <p className="font-serif text-2xl font-semibold leading-none text-indigo-950">{value}</p>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={withLocalePath("/projects", locale)}
              className="magnetic-button inline-flex h-12 items-center gap-2 rounded-full border border-indigo-900 bg-indigo-900 px-5 text-base font-bold text-white shadow-[0_2px_10px_rgba(15,45,78,0.2)] transition hover:-translate-y-0.5 hover:bg-indigo-800 focus-ring"
            >
              {t.workCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={withLocalePath("/about", locale)}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-indigo-200 bg-white px-5 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:border-indigo-400 focus-ring"
            >
              {t.resumeCta}
            </Link>
          </div>
        </div>

        <aside className="relative mx-auto w-full max-w-xl rounded-lg border border-[#DAE2EA] bg-white p-5 shadow-[0_1px_2px_rgba(15,45,78,0.04)] md:p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-[60px] shrink-0 overflow-hidden rounded-md border border-indigo-200 bg-indigo-50/60 shadow-[0_2px_8px_rgba(15,45,78,0.12)]">
              <Image src="/images/yaokai-portrait.jpg" alt="姚凯" fill className="object-cover" sizes="60px" priority />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-950">姚凯 Yao Kai</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">Web · iOS · Android · Backend · AWS</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="editorial-label">{t.runningLabel}</p>
            <div className="mt-3 grid gap-3">
              {t.running.map(([name, line, href, label]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-md border border-[#DAE2EA] bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 focus-ring"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-black text-indigo-900">{name}</p>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-700" />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{line}</p>
                  <p className="mt-1.5 text-xs font-semibold tracking-wide text-sky-600">{label}</p>
                </a>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-[#DAE2EA] pt-4">
            <a
              href="https://github.com/yaokai4/yaokai.me"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-900 focus-ring"
            >
              <Github className="h-4 w-4" />
              {t.runningNote}
            </a>
          </div>
        </aside>
      </section>

      {/* proof */}
      <section className="border-y border-[#DAE2EA] bg-white/82 py-10">
        <div className="section-container grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="editorial-label mb-3">{t.proofEyebrow}</p>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-indigo-950 md:text-3xl">{t.proofTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">{t.proofLead}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {t.proofItems.map(([title, description], index) => (
              <article key={title} className="rounded-md border border-[#DAE2EA] bg-white p-4 shadow-[0_1px_2px_rgba(15,45,78,0.04)]">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-sky-200 bg-sky-50 text-xs font-black text-sky-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-black text-slate-950">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* projects */}
      <section className="section-container scroll-mt-28 py-12 md:py-16">
        <div className="mb-9 max-w-3xl">
          <p className="editorial-label mb-3">{t.projectsEyebrow}</p>
          <h2 className="text-2xl font-black leading-tight tracking-tight text-indigo-950 md:text-4xl">{t.projectsTitle}</h2>
          <div className="editorial-bar mt-4 w-full" />
          <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">{t.projectsLead}</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {projectCards.map((p) => (
            <article key={p.name} className="flex h-full flex-col rounded-lg border border-[#DAE2EA] bg-white p-6 shadow-[0_1px_2px_rgba(15,45,78,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_6px_20px_rgba(15,45,78,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl font-black tracking-tight text-indigo-900">{p.name}</h3>
                <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-800">
                  {p.status[locale]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{p.desc[locale]}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{p.did[locale]}</p>
              <p className="mt-4 text-xs leading-6 tracking-wide text-slate-500">{p.tech}</p>
              <div className="mt-auto flex items-center gap-4 border-t border-indigo-100 pt-4">
                <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-800 transition hover:text-indigo-900 focus-ring">
                  {t.visitLabel}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-900 focus-ring">
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* scope */}
      <section className="section-container scroll-mt-28 py-12 md:py-16">
        <div className="mb-9 max-w-3xl">
          <p className="editorial-label mb-3">{t.scopeEyebrow}</p>
          <h2 className="text-2xl font-black leading-tight tracking-tight text-indigo-950 md:text-4xl">{t.scopeTitle}</h2>
          <div className="editorial-bar mt-4 w-full" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {t.scopeItems.map(([title, description], index) => (
            <article key={title} className="rounded-lg border border-[#DAE2EA] bg-white p-5 shadow-[0_1px_2px_rgba(15,45,78,0.04)]">
              <p className="text-xs font-bold tracking-[0.18em] text-sky-600">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-lg font-black leading-tight text-slate-950">{title}</h3>
              <p className="mt-2.5 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* writing */}
      <section className="section-container scroll-mt-28 py-12 md:py-16">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="editorial-label mb-3">{t.writingEyebrow}</p>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-indigo-950 md:text-4xl">{t.writingTitle}</h2>
            <div className="editorial-bar mt-4 w-full" />
            <p className="mt-4 text-base leading-8 text-slate-600">{t.writingLead}</p>
          </div>
          <Link
            href={withLocalePath("/blog", locale)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-800 transition hover:gap-2.5 hover:text-indigo-900 focus-ring"
          >
            {t.allArticles}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {selectedArticles.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {selectedArticles.map((article) => (
              <Link
                key={article.id}
                href={withLocalePath(`/blog/${article.slug}`, locale)}
                className="group block h-full rounded-lg border border-[#DAE2EA] bg-white p-5 shadow-[0_1px_2px_rgba(15,45,78,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_6px_20px_rgba(15,45,78,0.08)] focus-ring"
              >
                <p className="text-xs font-bold tracking-wide text-sky-600">{article.category}</p>
                <h3 className="mt-3 text-xl font-black leading-snug text-slate-950 group-hover:text-indigo-900">{article.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-800">
                  {t.readArticle}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#C9D6E2] bg-white p-8 text-center">
            <PenLine className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-3 text-sm text-slate-500">
              {locale === "ja" ? "最初の記事を準備中です。" : locale === "en" ? "First posts are on the way." : "第一批文章正在路上。"}
            </p>
          </div>
        )}
      </section>

      {/* now */}
      <section className="section-container scroll-mt-28 py-12 md:py-16">
        <div className="mb-9 max-w-3xl">
          <p className="editorial-label mb-3">{t.nowEyebrow}</p>
          <h2 className="text-2xl font-black leading-tight tracking-tight text-indigo-950 md:text-4xl">{t.nowTitle}</h2>
          <div className="editorial-bar mt-4 w-full" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {visibleNow.map((item) => (
            <article key={item.id} className="rounded-lg border border-[#DAE2EA] bg-white p-5 shadow-[0_1px_2px_rgba(15,45,78,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold tracking-wide text-indigo-800">{item.type}</span>
                <span className="text-xs font-black text-indigo-700">{item.status}</span>
              </div>
              <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-800" style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="border-y border-[#DAE2EA] bg-white py-16 md:py-20">
        <div className="section-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="editorial-label">Contact</p>
            <h2 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-indigo-950 md:text-5xl">{t.ctaTitle}</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              {t.ctaLead}
              <a href="mailto:hi@yaokai.me" className="ml-2 font-bold text-indigo-800 hover:text-indigo-900">
                hi@yaokai.me
              </a>
            </p>
          </div>
          <Link
            href={withLocalePath("/contact", locale)}
            className="magnetic-button inline-flex h-12 items-center gap-2 rounded-full border border-indigo-900 bg-indigo-900 px-6 text-base font-bold text-white shadow-[0_2px_10px_rgba(15,45,78,0.2)] transition hover:-translate-y-0.5 hover:bg-indigo-800 focus-ring"
          >
            <Mail className="h-4 w-4" />
            {t.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
