import type { Locale } from "@/lib/i18n";

export const siteCopy = {
  zh: {
    common: {
      all: "全部",
      clearSearch: "清空搜索",
      filterAria: "内容筛选",
      tableOfContents: "目录",
      tableOfContentsAria: "文章目录",
      backToTop: "返回顶部"
    },
    pages: {
      projects: {
        metaTitle: "作品集 - 姚凯",
        metaDescription: "姚凯的真实项目：Machi、Shangence 商衡、yaokai.me，以及公开 GitHub 仓库。",
        eyebrow: "作品集",
        title: "我真正做过、正在维护的项目。",
        description: "这里放简历和 GitHub 上能对得上的项目：Machi、Shangence 商衡、本站，以及 Machi 的 Web / iOS / Android 三端实现。"
      },
      blog: {
        metaTitle: "文章 - 姚凯",
        metaDescription: "姚凯的开发笔记、项目复盘、踩坑记录和求职相关心得。",
        eyebrow: "文章",
        title: "开发笔记，慢慢写。",
        description: "这里以后主要放我从后台发布的心得：项目复盘、踩坑记录、架构取舍、上架准备，以及在日本找工作的真实记录。"
      },
      guide: {
        metaTitle: "指南 - 姚凯",
        metaDescription: "关于 AI 工作流、全栈开发、iOS 工程、产品判断和高级界面打磨的可执行指南。",
        eyebrow: "指南",
        title: "把真实项目经验压缩成清晰、可执行、可检查的步骤。",
        description: "这里收集 AI 协作、Next.js 全栈结构、Machi iOS 离线优先、Machi Web 双端同步、产品判断和视觉打磨等指南。"
      },
      resources: {
        metaTitle: "资源库 - 姚凯",
        metaDescription: "开发、设计、AI 工作流、产品判断与 Machi 双端工程相关的精选资源。",
        eyebrow: "资源库",
        title: "不是普通链接收藏，而是长期工作台的一部分。",
        description: "这里包括 AI 协作工具、Next.js/React/Prisma、SwiftUI/SwiftData、Python、SQLite，以及用于产品判断和视觉审美的高质量参考资源。"
      },
      posts: {
        metaTitle: "动态 - 姚凯",
        metaDescription: "短更新、构建记录、想法碎片和正在推进的真实信号。",
        eyebrow: "动态",
        title: "更轻的记录，更真实的现场。",
        description: "这里发布构建过程、实验记录、短想法和还在形成中的判断，让网站保持正在发生的状态。",
        emptyTitle: "暂无公开动态"
      }
    },
    explorers: {
      projects: {
        count: (count: number) => `${count} 个案例`,
        filterHint: "按技术栈、产品类型和能力证据筛选",
        placeholder: "搜索项目、技术栈、角色或分类",
        emptyTitle: "没有找到项目",
        emptyDescription: "换一个关键词或分类试试。",
        featured: "精选案例",
        view: "查看完整案例"
      },
      blog: {
        count: (count: number) => `${count} 篇文章`,
        filterHint: "按工程、产品、AI 工作流和设计判断筛选",
        placeholder: "搜索文章、标签或分类",
        emptyTitle: "没有找到文章",
        emptyDescription: "换一个关键词或分类试试。",
        readMore: "继续阅读",
        featureKicker: "Digital Garden",
        featureLead: "判断、取舍和真实构建复盘"
      },
      guide: {
        count: (count: number) => `${count} 篇指南`,
        filterHint: "按项目经验、技术栈和适合人群筛选",
        placeholder: "搜索指南、技术栈或适合人群",
        emptyTitle: "没有找到指南",
        emptyDescription: "换一个关键词或分类试试。",
        featured: "精选指南",
        recommended: "推荐先读",
        audiencePrefix: "适合：",
        enter: "进入方法指南"
      },
      resources: {
        count: (count: number) => `${count} 个资源`,
        filterHint: "按工具、文档、设计参考和真实使用场景筛选",
        placeholder: "搜索资源、技术或使用场景",
        emptyTitle: "没有找到资源",
        emptyDescription: "换一个关键词或分类试试。",
        useCasePrefix: "使用场景：",
        open: "查看资源",
        workbench: "Creator Workbench"
      }
    },
    details: {
      project: {
        metaSuffix: "项目",
        back: "返回作品集",
        liveDemo: "在线演示",
        privateProject: "私有项目，仅展示案例说明",
        techStack: "技术栈",
        fallbackArchitecture: "架构说明会随着真实项目资料继续补齐，确保案例不只停留在表层展示。",
        fallbackNextStep: "后续会继续补充截图、数据和复盘，让案例成为可持续更新的项目证据。",
        sections: {
          overview: "项目概览",
          role: "我的角色",
          problem: "核心问题",
          solution: "解决方案",
          architecture: "架构设计",
          technicalHighlights: "技术亮点",
          result: "最终结果",
          retrospective: "复盘与下一步"
        },
        screenshots: "真实界面截图",
        previous: "上一个项目",
        next: "下一个项目",
        nextReading: "继续探索",
        allProjects: "全部项目",
        relatedGuides: "相关指南",
        allGuides: "全部指南",
        relatedArticles: "相关文章",
        allArticles: "全部文章",
        breadcrumbHome: "首页",
        breadcrumbProjects: "作品"
      },
      blog: {
        back: "返回文章",
        previous: "上一篇",
        next: "下一篇",
        nextReading: "下一步阅读",
        allArticles: "全部文章",
        relatedGuides: "相关指南",
        allGuides: "全部指南",
        breadcrumbHome: "首页",
        breadcrumbBlog: "文章"
      },
      guide: {
        metaSuffix: "指南",
        back: "返回指南",
        audience: "适合人群",
        previous: "上一篇指南",
        next: "下一篇指南",
        relatedProjects: "相关项目",
        allProjects: "全部项目",
        relatedArticles: "相关文章",
        allArticles: "全部文章"
      }
    }
  },
  ja: {
    common: {
      all: "すべて",
      clearSearch: "検索をクリア",
      filterAria: "コンテンツフィルター",
      tableOfContents: "目次",
      tableOfContentsAria: "記事の目次",
      backToTop: "先頭へ戻る"
    },
    pages: {
      projects: {
        metaTitle: "制作実績 - Yaokai",
        metaDescription: "Machi、Shangence 商衡、yaokai.me と公開 GitHub リポジトリ。",
        eyebrow: "制作実績",
        title: "実際に作り、今も手を入れているプロジェクトです。",
        description: "職務経歴書と GitHub で確認できるものを中心にまとめました。Machi、Shangence 商衡、このサイト、そして Machi の Web / iOS / Android です。"
      },
      blog: {
        metaTitle: "記事 - Yaokai",
        metaDescription: "開発メモ、プロジェクトの振り返り、詰まった点、日本での就職活動について。",
        eyebrow: "記事",
        title: "開発メモを少しずつ書きます。",
        description: "管理画面から、プロジェクトの振り返り、詰まった点、設計判断、アプリ公開準備、日本での就職活動について書いていきます。"
      },
      guide: {
        metaTitle: "ガイド - Yaokai",
        metaDescription: "AI ワークフロー、フルスタック開発、iOS、プロダクト判断、デザインの再利用できるガイド。",
        eyebrow: "ガイド",
        title: "実案件の経験を、実行しやすく検証できる手順に整理します。",
        description: "AI 協業、Next.js フルスタック構成、Machi iOS のオフライン優先、Machi Web の同期、プロダクト判断、UI 改善を扱います。"
      },
      resources: {
        metaTitle: "リソース - Yaokai",
        metaDescription: "開発、デザイン、AI ワークフロー、Machi の両端開発に関する参考資料。",
        eyebrow: "リソース",
        title: "ただのリンク集ではなく、長期的な作業台の一部です。",
        description: "AI 協業ツール、Next.js/React/Prisma、SwiftUI/SwiftData、Python、SQLite、プロダクトと視覚判断の参考資料をまとめています。"
      },
      posts: {
        metaTitle: "近況 - Yaokai",
        metaDescription: "短い更新、考え、記録、進行中の学び。",
        eyebrow: "近況",
        title: "軽い記録で、いま起きていることを見せます。",
        description: "制作メモ、実験記録、短い考え、まだ形になりきっていない判断を残す場所です。",
        emptyTitle: "公開中の近況はまだありません"
      }
    },
    explorers: {
      projects: {
        count: (count: number) => `${count} 件のケース`,
        filterHint: "技術、プロダクト種別、能力の証拠で絞り込み",
        placeholder: "プロジェクト、技術、カテゴリを検索",
        emptyTitle: "プロジェクトが見つかりません",
        emptyDescription: "別のキーワードかカテゴリを試してください。",
        featured: "注目ケース",
        view: "ケース全体を見る"
      },
      blog: {
        count: (count: number) => `${count} 件の記事`,
        filterHint: "エンジニアリング、プロダクト、AI ワークフロー、デザイン判断で絞り込み",
        placeholder: "記事、タグ、カテゴリを検索",
        emptyTitle: "記事が見つかりません",
        emptyDescription: "別のキーワードかカテゴリを試してください。",
        readMore: "続きを読む",
        featureKicker: "Digital Garden",
        featureLead: "判断、取捨選択、構築の振り返り"
      },
      guide: {
        count: (count: number) => `${count} 件のガイド`,
        filterHint: "実案件、技術スタック、対象読者で絞り込み",
        placeholder: "ガイド、技術、対象読者を検索",
        emptyTitle: "ガイドが見つかりません",
        emptyDescription: "別のキーワードかカテゴリを試してください。",
        featured: "注目ガイド",
        recommended: "最初に読む",
        audiencePrefix: "対象：",
        enter: "方法ガイドを開く"
      },
      resources: {
        count: (count: number) => `${count} 件のリソース`,
        filterHint: "ツール、資料、デザイン参考、利用シーンで絞り込み",
        placeholder: "リソース、技術、利用シーンを検索",
        emptyTitle: "リソースが見つかりません",
        emptyDescription: "別のキーワードかカテゴリを試してください。",
        useCasePrefix: "利用シーン：",
        open: "リソースを開く",
        workbench: "Creator Workbench"
      }
    },
    details: {
      project: {
        metaSuffix: "プロジェクト",
        back: "制作実績へ戻る",
        liveDemo: "デモを見る",
        privateProject: "非公開プロジェクトのため、ケース説明のみ掲載しています",
        techStack: "技術スタック",
        fallbackArchitecture: "実案件の資料に合わせて、アーキテクチャ説明を追加していきます。",
        fallbackNextStep: "実際の利用フィードバックに合わせて、スクリーンショット、データ、振り返りを更新します。",
        sections: {
          overview: "概要",
          role: "担当範囲",
          problem: "課題",
          solution: "解決策",
          architecture: "アーキテクチャ",
          technicalHighlights: "技術的な見どころ",
          result: "結果",
          retrospective: "振り返りと次の一手"
        },
        screenshots: "実画面スクリーンショット",
        previous: "前のプロジェクト",
        next: "次のプロジェクト",
        nextReading: "次に読む",
        allProjects: "すべての制作実績",
        relatedGuides: "関連ガイド",
        allGuides: "すべてのガイド",
        relatedArticles: "関連記事",
        allArticles: "すべての記事",
        breadcrumbHome: "ホーム",
        breadcrumbProjects: "制作実績"
      },
      blog: {
        back: "記事へ戻る",
        previous: "前の記事",
        next: "次の記事",
        nextReading: "次に読む",
        allArticles: "すべての記事",
        relatedGuides: "関連ガイド",
        allGuides: "すべてのガイド",
        breadcrumbHome: "ホーム",
        breadcrumbBlog: "記事"
      },
      guide: {
        metaSuffix: "ガイド",
        back: "ガイドへ戻る",
        audience: "対象読者",
        previous: "前のガイド",
        next: "次のガイド",
        relatedProjects: "関連プロジェクト",
        allProjects: "すべての制作実績",
        relatedArticles: "関連記事",
        allArticles: "すべての記事"
      }
    }
  },
  en: {
    common: {
      all: "All",
      clearSearch: "Clear search",
      filterAria: "Content filter",
      tableOfContents: "Contents",
      tableOfContentsAria: "Table of contents",
      backToTop: "Back to top"
    },
    pages: {
      projects: {
        metaTitle: "Work - Yaokai",
        metaDescription: "Real projects by Yaokai: Machi, Shangence, yaokai.me, and public GitHub repositories.",
        eyebrow: "Work",
        title: "Projects I actually built and still maintain.",
        description: "This page focuses on work that matches my resume and GitHub: Machi, Shangence, this site, and the Web / iOS / Android clients behind Machi."
      },
      blog: {
        metaTitle: "Writing - Yaokai",
        metaDescription: "Development notes, project retrospectives, debugging notes, and thoughts from job hunting in Japan.",
        eyebrow: "Writing",
        title: "Development notes, written gradually.",
        description: "A place for posts I publish from the admin: project retrospectives, trade-offs, bugs, release prep, and notes from job hunting in Japan."
      },
      guide: {
        metaTitle: "Guides - Yaokai",
        metaDescription: "Reusable guides for AI workflows, full-stack development, iOS engineering, product judgment, and visual craft.",
        eyebrow: "Guides",
        title: "Practical guides distilled into clear, executable, checkable steps.",
        description: "A growing library for AI collaboration, Next.js full-stack structure, Machi iOS offline-first design, Machi Web sync, product judgment, and interface polish."
      },
      resources: {
        metaTitle: "Resources - Yaokai",
        metaDescription: "Development, design, AI workflow, and Machi engineering resources.",
        eyebrow: "Resources",
        title: "Not a random link list, but part of a long-term workbench.",
        description: "AI collaboration tools, Next.js/React/Prisma, SwiftUI/SwiftData, Python, SQLite, and references for product and visual judgment."
      },
      posts: {
        metaTitle: "Updates - Yaokai",
        metaDescription: "Short updates, notes, records, and work in progress.",
        eyebrow: "Updates",
        title: "Lighter notes, closer to the work in progress.",
        description: "Build notes, experiments, short thoughts, and ideas still taking shape.",
        emptyTitle: "No public updates yet"
      }
    },
    explorers: {
      projects: {
        count: (count: number) => `${count} cases`,
        filterHint: "Filter by stack, product type, and evidence of capability",
        placeholder: "Search projects, stack, role, or category",
        emptyTitle: "No projects found",
        emptyDescription: "Try another keyword or category.",
        featured: "Featured Case",
        view: "View full case"
      },
      blog: {
        count: (count: number) => `${count} articles`,
        filterHint: "Filter by engineering, product, AI workflow, and design judgment",
        placeholder: "Search articles, tags, or category",
        emptyTitle: "No articles found",
        emptyDescription: "Try another keyword or category.",
        readMore: "Continue reading",
        featureKicker: "Digital Garden",
        featureLead: "Judgment, tradeoffs, and build retrospectives"
      },
      guide: {
        count: (count: number) => `${count} guides`,
        filterHint: "Filter by project experience, stack, and audience",
        placeholder: "Search guides, stack, or audience",
        emptyTitle: "No guides found",
        emptyDescription: "Try another keyword or category.",
        featured: "Featured Guide",
        recommended: "Recommended first",
        audiencePrefix: "For: ",
        enter: "Open method guide"
      },
      resources: {
        count: (count: number) => `${count} resources`,
        filterHint: "Filter by tools, docs, design references, and use cases",
        placeholder: "Search resources, technology, or use case",
        emptyTitle: "No resources found",
        emptyDescription: "Try another keyword or category.",
        useCasePrefix: "Use case: ",
        open: "View resource",
        workbench: "Creator Workbench"
      }
    },
    details: {
      project: {
        metaSuffix: "Project",
        back: "Back to work",
        liveDemo: "Live demo",
        privateProject: "Private project, case notes only",
        techStack: "Tech Stack",
        fallbackArchitecture: "Architecture notes will continue to expand with real project material so the case stays grounded.",
        fallbackNextStep: "Screenshots, data, and retrospectives will keep evolving so the case remains useful after launch.",
        sections: {
          overview: "Overview",
          role: "My Role",
          problem: "Problem",
          solution: "Solution",
          architecture: "Architecture",
          technicalHighlights: "Technical Highlights",
          result: "Result",
          retrospective: "Retrospective"
        },
        screenshots: "Real interface screenshots",
        previous: "Previous project",
        next: "Next project",
        nextReading: "Keep exploring",
        allProjects: "All projects",
        relatedGuides: "Related guides",
        allGuides: "All guides",
        relatedArticles: "Related articles",
        allArticles: "All articles",
        breadcrumbHome: "Home",
        breadcrumbProjects: "Work"
      },
      blog: {
        back: "Back to writing",
        previous: "Previous article",
        next: "Next article",
        nextReading: "Next reading",
        allArticles: "All articles",
        relatedGuides: "Related guides",
        allGuides: "All guides",
        breadcrumbHome: "Home",
        breadcrumbBlog: "Writing"
      },
      guide: {
        metaSuffix: "Guide",
        back: "Back to guides",
        audience: "Audience",
        previous: "Previous guide",
        next: "Next guide",
        relatedProjects: "Related projects",
        allProjects: "All projects",
        relatedArticles: "Related articles",
        allArticles: "All articles"
      }
    }
  }
} as const satisfies Record<Locale, unknown>;
