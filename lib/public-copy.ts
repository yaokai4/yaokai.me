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
        metaDescription: "姚凯真正做过并持续维护的项目：Machi、Shangence 商衡、yaokai.me，以及公开 GitHub 仓库。",
        eyebrow: "作品集",
        title: "这些不是概念图，而是我真正推到线上的作品。",
        description: "从 Machi、Shangence 商衡到本站，我会把能公开的背景、取舍、实现方式和后续维护都放在这里，而不是只留下几张好看的截图。"
      },
      blog: {
        metaTitle: "文章 - 姚凯",
        metaDescription: "姚凯的开发笔记、项目复盘、技术取舍，以及在日本生活与求职中的观察。",
        eyebrow: "文章",
        title: "写一点代码背后的东西。",
        description: "项目复盘、踩坑记录、架构取舍、上架准备，以及在日本生活和求职时慢慢形成的判断，都会放在这里。"
      },
      guide: {
        metaTitle: "指南 - 姚凯",
        metaDescription: "关于 AI 工作流、全栈开发、iOS 工程、产品判断和高级界面打磨的可执行指南。",
        eyebrow: "指南",
        title: "把走过的路，整理成可以复用的方法。",
        description: "这里收集 AI 协作、Next.js 全栈结构、Machi iOS 离线优先、Machi Web 同步、产品判断和界面打磨等指南。每一篇都尽量具体、可执行、可回头检查。"
      },
      resources: {
        metaTitle: "资源库 - 姚凯",
        metaDescription: "开发、设计、AI 工作流、产品判断与 Machi 双端工程相关的精选资源。",
        eyebrow: "资源库",
        title: "长期放在手边的工具和参考。",
        description: "这里包括 AI 协作工具、Next.js/React/Prisma、SwiftUI/SwiftData、Python、SQLite，也包括帮助我判断产品、视觉和写作的参考。"
      },
      posts: {
        metaTitle: "动态 - 姚凯",
        metaDescription: "短更新、构建记录、想法碎片和正在推进的真实信号。",
        eyebrow: "动态",
        title: "短一点，离现场近一点。",
        description: "这里发布构建过程、实验记录、短想法和还没完全成形的判断，让网站不只是展示过去，也能保留正在发生的部分。",
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
        metaTitle: "制作実績 - 姚凱",
        metaDescription: "Machi、Shangence 商衡、yaokai.me など、実際に作り、今も手を入れているプロジェクト。",
        eyebrow: "制作実績",
        title: "構想ではなく、実際に動かしているもの。",
        description: "Machi、Shangence 商衡、このサイトを中心に、公開できる背景、判断、実装、運用のことをまとめています。きれいなスクリーンショットだけで終わらせないためのページです。"
      },
      blog: {
        metaTitle: "記事 - 姚凱",
        metaDescription: "開発メモ、プロジェクトの振り返り、技術選定、日本で暮らしながら考えたこと。",
        eyebrow: "記事",
        title: "コードの裏側にある考えを、少しずつ。",
        description: "プロジェクトの振り返り、詰まったところ、設計の判断、アプリ公開準備、日本での生活や就職活動の中で考えたことを書いていきます。"
      },
      guide: {
        metaTitle: "ガイド - 姚凱",
        metaDescription: "AI ワークフロー、フルスタック開発、iOS、プロダクト判断、デザインの再利用できるガイド。",
        eyebrow: "ガイド",
        title: "通ってきた道を、もう一度使える手順にする。",
        description: "AI との協業、Next.js のフルスタック構成、Machi iOS のオフライン優先、Machi Web の同期、プロダクト判断、UI 改善を扱います。できるだけ具体的で、あとから検証できる形にします。"
      },
      resources: {
        metaTitle: "リソース - 姚凱",
        metaDescription: "開発、デザイン、AI ワークフロー、Machi の両端開発に関する参考資料。",
        eyebrow: "リソース",
        title: "手元に置いておきたい道具と資料。",
        description: "AI 協業ツール、Next.js/React/Prisma、SwiftUI/SwiftData、Python、SQLite、プロダクト判断や視覚表現の参考になる資料をまとめています。"
      },
      posts: {
        metaTitle: "近況 - 姚凱",
        metaDescription: "短い更新、考え、記録、進行中の学び。",
        eyebrow: "近況",
        title: "短く、現場に近い記録。",
        description: "制作メモ、実験記録、短い考え、まだ形になりきっていない判断を残します。過去の実績だけでなく、いま動いているものも見えるように。",
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
        metaDescription: "Projects Yaokai actually built and still maintains: Machi, Shangence, yaokai.me, and public GitHub repositories.",
        eyebrow: "Work",
        title: "Not concepts. Things I built, shipped, and still maintain.",
        description: "Machi, Shangence, and this site are gathered here with the context I can share: what I was trying to solve, what I chose, how I built it, and what still needs care."
      },
      blog: {
        metaTitle: "Writing - Yaokai",
        metaDescription: "Development notes, project retrospectives, technical trade-offs, and observations from life and work in Japan.",
        eyebrow: "Writing",
        title: "Notes from behind the code.",
        description: "Project retrospectives, trade-offs, bugs, release prep, and thoughts that formed while living and job hunting in Japan."
      },
      guide: {
        metaTitle: "Guides - Yaokai",
        metaDescription: "Reusable guides for AI workflows, full-stack development, iOS engineering, product judgment, and visual craft.",
        eyebrow: "Guides",
        title: "Turning paths I have walked into methods I can reuse.",
        description: "A growing library for AI collaboration, Next.js full-stack structure, Machi iOS offline-first design, Machi Web sync, product judgment, and interface polish. Specific enough to act on, clear enough to revisit."
      },
      resources: {
        metaTitle: "Resources - Yaokai",
        metaDescription: "Development, design, AI workflow, and Machi engineering resources.",
        eyebrow: "Resources",
        title: "Tools and references worth keeping close.",
        description: "AI collaboration tools, Next.js/React/Prisma, SwiftUI/SwiftData, Python, SQLite, and references that help me think about product, interface, and writing."
      },
      posts: {
        metaTitle: "Updates - Yaokai",
        metaDescription: "Short updates, notes, records, and work in progress.",
        eyebrow: "Updates",
        title: "Short notes, close to the work.",
        description: "Build notes, experiments, small thoughts, and ideas still taking shape, so the site can show what is happening now as well as what is already finished.",
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
