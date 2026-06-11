import type { Locale } from "@/lib/i18n";

type ProjectTranslation = {
  title?: string;
  subtitle?: string | null;
  excerpt?: string;
  longDescription?: string | null;
  category?: string;
  status?: string;
  role?: string;
  background?: string | null;
  challenge?: string;
  solution?: string;
  result?: string;
  architectureNotes?: string | null;
  responsibilities?: string[];
  keyChallenges?: string[];
  solutions?: string[];
  features?: string[];
  technicalHighlights?: string[];
  metrics?: string[];
  measurableResults?: string[];
  lessons?: string[];
  nextSteps?: string[];
  content?: string;
};

type LocalizableProject = {
  slug: string;
};

export const projectTranslations: Record<string, Partial<Record<Locale, ProjectTranslation>>> = {
  "machi-web-unified-python-backend": {
    ja: {
      title: "Machi Web と共通 Python バックエンド",
      subtitle: "Machi / Web + API",
      excerpt: "都市生活コミュニティ Machi の Web クライアントと共通バックエンド。投稿、賃貸、中古、求人、DM、通知、会員状態、メディアアップロードを支えます。",
      longDescription:
        "Machi は私が一人で開発している都市生活コミュニティです。Web は Next.js、バックエンドは Python API で構成し、Web / iOS / Android が同じアカウント、投稿、通知、会員状態を共有します。",
      category: "Machi / Web",
      status: "Web Beta",
      role: "プロダクト設計、フルスタック構成、Web クライアント、Python API、DB、デプロイ運用",
      background: "東京での生活情報、賃貸、中古、仕事、地域サービス、交流を一つの都市空間にまとめたいと考えました。",
      challenge: "Web、iOS、Android が同じ事実を共有しながら、それぞれの操作感を保つ必要がありました。",
      solution: "アカウント、Feed、投稿、DM、通知、メディア、会員状態を共通 API に集約し、互換 DTO で複数クライアントのズレを抑えました。",
      result: "80+ REST + SSE API、19テーブル、メディアアップロード、soft delete、cursor pagination、多クライアント同期の基盤を構築しました。",
      responsibilities: ["プロダクト設計", "Next.js Web", "Python REST + SSE API", "DB 設計", "AWS / Nginx / systemd 運用"],
      keyChallenges: ["多クライアント DTO", "都市・言語・投稿タイプの検索", "メディア配信", "DM / 通知のリアルタイム性"],
      solutions: ["ユーザー、投稿、通知、会員状態を共通 API に集約", "互換フィールドを保つ DTO", "オブジェクトストレージと CDN", "SSE による軽量リアルタイム更新"],
      measurableResults: ["Web Beta 公開中", "3クライアントが共通 API を利用", "PostgreSQL 移行とアプリ公開へ進める基盤"],
      lessons: ["多クライアント製品では、データ契約の安定性が一番重要です。"],
      nextSteps: ["iOS / Android の公開準備", "実画面スクリーンショットの追加", "PostgreSQL への段階的移行"],
      content: `## 背景

Machi は私が一人で開発している都市生活コミュニティです。賃貸、中古、求人、地域サービス、Q&A、DM、通知、会員機能を一つの都市空間にまとめています。

## 担当範囲

プロダクト設計、Web クライアント、共通バックエンド、DB、API 契約、デプロイ、運用まで担当しています。

## 技術構成

- Web: Next.js / React / TypeScript / Tailwind CSS
- API: Python REST + SSE
- Data: SQLite から PostgreSQL へ移行できる前提で設計
- Ops: AWS / Nginx / systemd / object storage / CDN

## 振り返り

Machi Web で学んだのは、フルスタックとは単に前後端を書くことではなく、ユーザー、データ、権限、メディア、通知、運用まで一つの製品として安定させることだという点です。`
    },
    en: {
      title: "Machi Web and Shared Python Backend",
      subtitle: "Machi / Web + API",
      excerpt: "The Web client and shared backend for Machi, a city-life community platform covering posts, housing, second-hand listings, jobs, messages, notifications, membership and media upload.",
      longDescription:
        "Machi is a city-life community product I build and run solo. The Web client uses Next.js, while a Python backend exposes the shared API used by Web, iOS and Android.",
      category: "Machi / Web",
      status: "Web Beta",
      role: "Product design, full-stack architecture, Web client, Python API, database, deployment and operations",
      background: "I wanted one city space for housing, second-hand goods, jobs, local services and daily community discussion in Tokyo.",
      challenge: "Web, iOS and Android needed to share the same data facts while keeping platform-specific interaction patterns.",
      solution: "I centralized accounts, feed, posts, messages, notifications, media and membership in one API, with compatible DTOs for all clients.",
      result: "Built the foundation: 80+ REST + SSE endpoints, 19 tables, media upload, soft delete, cursor pagination and multi-client sync.",
      responsibilities: ["Product planning", "Next.js Web client", "Python REST + SSE API", "Database design", "AWS / Nginx / systemd operations"],
      keyChallenges: ["Multi-client DTO stability", "City / language / content filters", "Media delivery", "Realtime messages and notifications"],
      solutions: ["Shared API for core facts", "Compatible DTO fields", "Object storage and CDN", "SSE for lightweight realtime updates"],
      measurableResults: ["Web Beta is live", "Three clients share one API", "Ready for PostgreSQL migration and app release work"],
      lessons: ["For multi-client products, the data contract matters more than surface similarity."],
      nextSteps: ["Prepare iOS / Android releases", "Add real product screenshots", "Move early data toward PostgreSQL"],
      content: `## Background

Machi is a city-life community product I build and run solo. It brings housing, second-hand listings, jobs, local services, Q&A, messages, notifications and membership into one city space.

## My Role

I handle product planning, Web development, the shared backend, database design, API contracts, deployment and operations.

## Stack

- Web: Next.js / React / TypeScript / Tailwind CSS
- API: Python REST + SSE
- Data: SQLite, designed with a PostgreSQL migration path
- Ops: AWS / Nginx / systemd / object storage / CDN

## Takeaway

Machi Web taught me that full-stack work is not just writing frontend and backend. It is keeping users, data, permissions, media, notifications and deployment reliable inside one product.`
    }
  },
  "machi-ios-native-city-life-app": {
    ja: {
      title: "Machi iOS ネイティブ都市生活クライアント",
      excerpt: "SwiftUI + SwiftData のオフライン優先 iOS クライアント。ホーム、発見、投稿、通知、DM、マイページ、設定をカバーします。",
      longDescription: "Machi iOS は Web のラッパーではなく、ローカル永続化、下書き、Keychain、同期復旧を持つネイティブアプリとして作っています。",
      category: "Machi / iOS",
      status: "公開準備中",
      role: "iOS 構成、SwiftUI UI、本地データ層、同期サービス、認証、機能設計",
      challenge: "オフライン閲覧、下書き、復旧同期、共通バックエンドとの境界を整理すること。",
      solution: "SwiftData、Repository、Service、Keychain を分け、認証・通信・同期・メディア・地域データを管理しました。",
      result: "Web と同じアカウント、投稿、DM、通知、会員状態を扱えるネイティブ iOS クライアント基盤を作りました。",
      measurableResults: ["App Store 公開準備中", "共通 API と同期", "オフライン優先の基盤"],
      nextSteps: ["公開素材の準備", "プライバシー説明の整理", "弱ネットワーク時の同期改善"],
      content: `## 背景

Machi iOS は都市生活コミュニティ Machi のネイティブクライアントです。単なる Feed ではなく、投稿、通知、DM、都市チャンネル、会員状態を持つアプリです。

## 技術構成

- SwiftUI: UI、NavigationStack、Tab
- SwiftData: ローカル永続化と Schema migration
- Repository: ローカルデータ読み書き
- Service: 認証、通信、同期、メディア、地域データ
- Keychain: 認証情報の保存

## 振り返り

オフライン優先はキャッシュだけではありません。データモデル、同期、失敗時の回復、ユーザー体験を一緒に設計する必要があります。`
    },
    en: {
      title: "Machi iOS Native City-Life Client",
      excerpt: "An offline-first iOS client built with SwiftUI and SwiftData, covering home, discovery, publishing, notifications, messages, profile and settings.",
      longDescription: "Machi iOS is not a Web wrapper. It has local persistence, drafts, Keychain-protected credentials and recovery-oriented sync.",
      category: "Machi / iOS",
      status: "App in preparation",
      role: "iOS architecture, SwiftUI screens, local data layer, sync service, auth and product features",
      challenge: "Keeping offline browsing, drafts, sync recovery and the shared backend cleanly separated.",
      solution: "I split local persistence, repositories, services and Keychain-backed auth into clear boundaries.",
      result: "Built a native iOS foundation that can share accounts, posts, messages, notifications and membership with Machi Web.",
      measurableResults: ["Preparing for App Store release", "Shared API integration", "Offline-first base"],
      nextSteps: ["Prepare store assets", "Polish privacy notes", "Improve weak-network sync"],
      content: `## Background

Machi iOS is the native iOS client for Machi. It is a real product client with publishing, interactions, messages, notifications, city channels and membership state.

## Stack

- SwiftUI for UI, NavigationStack and tabs
- SwiftData for local persistence and schema migration
- Repository layer for local reads and writes
- Service layer for auth, networking, sync, media and region data
- Keychain for credentials

## Takeaway

Offline-first is not just caching. It means designing data, sync, failure recovery and user experience together.`
    }
  },
  "machi-android-native-city-life-app": {
    ja: {
      title: "Machi Android ネイティブ都市生活クライアント",
      excerpt: "Kotlin / Jetpack Compose で作った Android クライアント。Machi を Android ユーザーにも届けるための第三のクライアントです。",
      category: "Machi / Android",
      status: "公開準備中",
      role: "Android クライアント実装、Compose UI、API 連携、プロダクトフロー整理",
      challenge: "共通 API を使いながら、Android らしい操作感と状態管理を保つこと。",
      solution: "Jetpack Compose で UI を構築し、Feed、投稿、通知、DM、プロフィールを共通 API と接続しました。",
      result: "Machi は Web / iOS / Android の3クライアント構成になり、多端末プロダクトとしての形が見えました。",
      measurableResults: ["Android リポジトリ公開", "3クライアント構成", "Google Play 公開準備中"],
      nextSteps: ["上架文案の整理", "スクリーンショット追加", "投稿とメディア体験の改善"],
      content: `## 背景

Machi Android は Machi のネイティブ Android クライアントです。Web / iOS に続く第三のクライアントとして、共通 API の設計を検証する役割もあります。

## 技術構成

- Kotlin
- Jetpack Compose
- Shared REST API
- Feed、投稿、通知、DM、プロフィール

## 振り返り

三端対応では、見た目よりも API 契約、エラー処理、機能境界を揃えることが重要です。`
    },
    en: {
      title: "Machi Android Native City-Life Client",
      excerpt: "A native Android client built with Kotlin and Jetpack Compose, bringing Machi to Android users.",
      category: "Machi / Android",
      status: "App in preparation",
      role: "Android implementation, Compose UI, API integration and product flow alignment",
      challenge: "Using the shared API while keeping native Android interaction and state management clear.",
      solution: "I built Compose screens and connected feed, publishing, notifications, messages and profile flows to the shared backend.",
      result: "Machi now has a Web / iOS / Android structure, proving it as a multi-client product rather than a single-page demo.",
      measurableResults: ["Android repo is public", "Three-client structure", "Preparing for Google Play"],
      nextSteps: ["Prepare store copy", "Add screenshots", "Improve publishing and media flows"],
      content: `## Background

Machi Android is the native Android client for Machi. It is the third client after Web and iOS, and it tests whether the shared API contract can hold across platforms.

## Stack

- Kotlin
- Jetpack Compose
- Shared REST API
- Feed, publishing, notifications, messages and profile

## Takeaway

For three-client products, API contracts, error handling and feature boundaries matter more than matching every surface detail.`
    }
  },
  "shangence-business-risk-assessment": {
    ja: {
      title: "Shangence 商衡",
      subtitle: "Business risk assessment",
      excerpt: "日本市場向けの事業リスク診断サービス。7ステップ診断、ルールスコア、Stripe円決済、PDFレポート、管理画面を備えています。",
      longDescription: "Shangence 商衡は私が一人で開発した二つ目のプロダクトです。日本で起業したい人のリスク、初期費用、検証方法、撤退基準、法務注意点を整理します。",
      category: "SaaS / 商用サービス",
      status: "運用中",
      role: "企画、診断ロジック、前後端、決済、PDF、管理画面、法務ページ、デプロイ",
      challenge: "診断は分かりやすく、決済は信頼でき、スコアは生成文ではなく再現可能なロジックで計算する必要がありました。",
      solution: "7ステップフォーム、ルールエンジン、Stripe円決済、PDF生成、注文・返金・監査を扱う管理画面を実装しました。",
      result: "無料診断、会員登録、有料レポート、PDF ダウンロード、管理画面運用までの商用導線を作りました。",
      measurableResults: ["公開運用中", "決済と管理画面を実装", "日本市場向け法務ページを整備"],
      nextSteps: ["診断質問の改善", "業種別シナリオ追加", "実際の反応に合わせたレポート改善"],
      content: `## 背景

Shangence 商衡は、日本で起業したい個人や小規模事業者のための事業リスク診断サービスです。

## 技術構成

- Next.js App Router
- Prisma / PostgreSQL
- Stripe JPY
- PDF report
- Zod / Vitest

## 振り返り

このプロジェクトでは、フォームだけでなく、決済、権限、返金、個人情報、監査、法務ページを一つの商用サービスとして成立させる必要がありました。`
    },
    en: {
      title: "Shangence",
      subtitle: "Business risk assessment",
      excerpt: "A business-risk assessment service for the Japanese market, with a 7-step assessment, rule-based scoring, Stripe JPY payments, PDF reports and an admin console.",
      longDescription: "Shangence is the second product I built solo. It helps people planning a business in Japan understand risk, cost, validation, exit criteria and legal considerations.",
      category: "SaaS / Commercial service",
      status: "Live",
      role: "Product planning, assessment logic, frontend, backend, payments, PDF reports, admin, legal pages and deployment",
      challenge: "The assessment needed to be clear, the payment flow trustworthy, and the score reproducible rather than generated text.",
      solution: "I built a 7-step form, rule engine, Stripe JPY payment flow, PDF reports and an admin console for orders, refunds and audit logs.",
      result: "Built the commercial loop from free assessment to sign-up, paid report, PDF download and admin operations.",
      measurableResults: ["Live service", "Payments and admin console implemented", "Legal pages ready for the Japanese market"],
      nextSteps: ["Improve assessment questions", "Add more industry scenarios", "Refine reports from real feedback"],
      content: `## Background

Shangence is a business-risk assessment service for people planning to start a business in Japan.

## Stack

- Next.js App Router
- Prisma / PostgreSQL
- Stripe JPY
- PDF reports
- Zod / Vitest

## Takeaway

This project went beyond forms. A commercial service has to handle payments, permissions, refunds, privacy, audit logs and legal pages as one system.`
    }
  },
  "yaokai-me-personal-site": {
    ja: {
      title: "yaokai.me 個人サイトと CMS",
      excerpt: "いま見ているこのサイト。Next.js 16 + Prisma、日中英3言語、記事・制作実績・経歴・問い合わせ・管理画面を備えています。",
      category: "個人サイト / CMS",
      status: "このサイト",
      role: "情報設計、ビジュアル、フルスタック実装、CMS、デプロイスクリプト、運用",
      challenge: "就職、制作実績、記事、問い合わせを一つのサイトで扱い、言語切替も安定させる必要がありました。",
      solution: "Next.js + Prisma で前台と管理画面を作り、ナビを整理し、Machi と Shangence を中心に据えました。",
      result: "公開コード付きの個人サイト兼 CMS として、今後も記事や制作実績を更新できます。",
      measurableResults: ["3言語対応", "管理画面あり", "GitHub 公開"],
      nextSteps: ["開発メモを継続公開", "プロダクト画面を追加", "就職活動の反応に合わせて文面調整"],
      content: `## 背景

yaokai.me は私の個人サイトであり、自分で使う小さな CMS でもあります。経歴、制作実績、記事、問い合わせを一つにまとめています。

## 技術構成

- Next.js 16 / React / TypeScript
- Prisma CMS
- Tailwind CSS
- path + cookie による日中英切替
- デプロイスクリプト

## 振り返り

今回の改善では、ページを増やすのではなくノイズを減らし、Machi と Shangence の開発者であることをはっきり伝えることを重視しました。`
    },
    en: {
      title: "yaokai.me Personal Site and CMS",
      excerpt: "The site you are reading. Built with Next.js 16 and Prisma, with three languages, writing, work, resume, contact form and admin CMS.",
      category: "Personal site / CMS",
      status: "This site",
      role: "Information architecture, visual design, full-stack implementation, CMS, deploy scripts and operations",
      challenge: "The site needed to support job search, project proof, writing and contact in one place, with reliable language switching.",
      solution: "I built the frontend and CMS with Next.js + Prisma, simplified navigation, and centered the story on Machi and Shangence.",
      result: "A maintainable personal site and CMS with public source code and room for ongoing writing.",
      measurableResults: ["3 languages", "Admin CMS", "Public GitHub repo"],
      nextSteps: ["Keep publishing development notes", "Add product screenshots", "Tune copy from hiring feedback"],
      content: `## Background

yaokai.me is my personal site and a small CMS I use myself. It brings together my resume, projects, writing and contact flow.

## Stack

- Next.js 16 / React / TypeScript
- Prisma CMS
- Tailwind CSS
- Path + cookie based language switching
- Deployment scripts

## Takeaway

This redesign was less about adding pages and more about removing noise: I wanted the site to clearly say that I build Machi and Shangence, and that I can carry a Web product from idea to production.`
    }
  }
};

export function localizeProject<T extends LocalizableProject>(project: T, locale: Locale): T {
  const translation = projectTranslations[project.slug]?.[locale];
  return translation ? ({ ...project, ...translation } as T) : project;
}

export function localizeProjects<T extends LocalizableProject>(projects: T[], locale: Locale): T[] {
  return projects.map((project) => localizeProject(project, locale));
}
