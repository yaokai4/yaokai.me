export const locales = ["zh", "ja", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";
export const localeCookieName = "yaokai_locale";

export const localeLabels: Record<Locale, string> = {
  zh: "中",
  ja: "日",
  en: "EN"
};

export const localeNames: Record<Locale, string> = {
  zh: "中文",
  ja: "日本語",
  en: "English"
};

export const htmlLang: Record<Locale, string> = {
  zh: "zh-CN",
  ja: "ja",
  en: "en"
};

export const hreflang: Record<Locale, string> = {
  zh: "zh-CN",
  ja: "ja-JP",
  en: "en"
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && (locales as readonly string[]).includes(value));
}

export function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) return defaultLocale;
  const normalized = value.toLowerCase();
  if (normalized.startsWith("ja")) return "ja";
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("zh")) return "zh";
  return defaultLocale;
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : null;
}

export function stripLocaleFromPathname(pathname: string) {
  const [pathOnly, suffix = ""] = pathname.split(/(?=[?#])/);
  const segments = pathOnly.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  const stripped = `/${segments.join("/")}`;
  return `${stripped === "/" ? "/" : stripped.replace(/\/+$/, "")}${suffix}`;
}

export function withLocalePath(href: string, locale: Locale) {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
    return href;
  }

  const [pathWithQuery, hash = ""] = href.split("#");
  const [pathOnly, query = ""] = pathWithQuery.split("?");
  const normalizedPath = stripLocaleFromPathname(pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`);
  const path = normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
  return `${path}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function localeAlternates(path = "/") {
  const cleanPath = stripLocaleFromPathname(path);
  return {
    [hreflang.zh]: withLocalePath(cleanPath, "zh"),
    [hreflang.ja]: withLocalePath(cleanPath, "ja"),
    [hreflang.en]: withLocalePath(cleanPath, "en"),
    "x-default": withLocalePath(cleanPath, defaultLocale)
  };
}

export const shellCopy = {
  zh: {
    brandSubtitle: "Creative Engineering",
    primaryNav: [
      ["首页", "/"],
      ["作品", "/projects"],
      ["文章", "/blog"],
      ["技术栈", "/stack"],
      ["关于", "/about"],
      ["联系", "/contact"]
    ],
    moreLabel: "更多",
    moreGroups: [
      {
        title: "Explore",
        links: [
          ["内容地图", "/explore", "按目的浏览作品、文章、指南和资源"],
          ["指南", "/guide", "可复用的开发与产品实践指南"],
          ["资源", "/resources", "工具、文档和参考资料"]
        ]
      },
      {
        title: "System",
        links: [
          ["方法论", "/playbook", "做事流程与项目拆解方式"],
          ["Library", "/library", "长期使用的资源库入口"],
          ["VPS 运维", "/vps/docs", "服务器与安全接入说明"]
        ]
      },
      {
        title: "Personal",
        links: [
          ["近况", "/now", "当前正在构建和研究的事"],
          ["宣言", "/manifesto", "关于创造、AI 和长期工作的原则"]
        ]
      }
    ],
    searchLabel: "搜索内容",
    searchShort: "搜索",
    searchPlaceholder: "搜索文章、项目、指南、资源、方法论...",
    searchLoading: "正在整理可浏览内容...",
    searchEmpty: "没有找到匹配内容，换个关键词试试。",
    contactCta: "合作联系",
    mobileTitle: "内容地图",
    mobileSubtitle: "选择一条路线继续探索",
    mobileSearch: "搜索文章、项目、指南",
    mobileContact: "开始合作沟通",
    footerBadge: "Personal Digital Product",
    footerTitle: "用技术、设计、产品思维与 AI 工作流，把复杂想法做成精致作品。",
    footerContact: "联系我",
    footerGroups: [
      { title: "主站", links: [["作品", "/projects"], ["文章", "/blog"], ["关于", "/about"], ["联系", "/contact"]] },
      { title: "系统", links: [["指南", "/guide"], ["方法论", "/playbook"], ["技术栈", "/stack"], ["资源库", "/library"], ["宣言", "/manifesto"]] }
    ],
    footerRights: "© 2026 姚凯。保留所有权利。",
    footerNote: "Built as a precise, multilingual personal website."
  },
  ja: {
    brandSubtitle: "Creative Engineering",
    primaryNav: [
      ["ホーム", "/"],
      ["制作実績", "/projects"],
      ["記事", "/blog"],
      ["技術スタック", "/stack"],
      ["プロフィール", "/about"],
      ["連絡", "/contact"]
    ],
    moreLabel: "その他",
    moreGroups: [
      {
        title: "Explore",
        links: [
          ["コンテンツマップ", "/explore", "目的別に制作実績、記事、ガイドを探す"],
          ["ガイド", "/guide", "再利用できる開発とプロダクトの実践ガイド"],
          ["リソース", "/resources", "ツール、資料、参考リンク"]
        ]
      },
      {
        title: "System",
        links: [
          ["プレイブック", "/playbook", "判断基準と制作プロセス"],
          ["ライブラリ", "/library", "長く使っている資料と道具"],
          ["VPS 運用", "/vps/docs", "サーバーと安全接続の説明"]
        ]
      },
      {
        title: "Personal",
        links: [
          ["現在地", "/now", "いま取り組んでいること"],
          ["マニフェスト", "/manifesto", "創作、AI、長期的な仕事の原則"]
        ]
      }
    ],
    searchLabel: "検索",
    searchShort: "検索",
    searchPlaceholder: "記事、プロジェクト、ガイド、リソースを検索...",
    searchLoading: "コンテンツを整理しています...",
    searchEmpty: "一致する内容が見つかりません。別のキーワードを試してください。",
    contactCta: "相談する",
    mobileTitle: "コンテンツ宇宙",
    mobileSubtitle: "気になる入口から見てください",
    mobileSearch: "記事・制作実績・ガイドを検索",
    mobileContact: "相談を始める",
    footerBadge: "Personal Digital Product",
    footerTitle: "技術、デザイン、プロダクト思考、AI ワークフローで、複雑なアイデアを美しいデジタル体験にします。",
    footerContact: "連絡する",
    footerGroups: [
      { title: "メイン", links: [["制作実績", "/projects"], ["記事", "/blog"], ["プロフィール", "/about"], ["連絡", "/contact"]] },
      { title: "システム", links: [["ガイド", "/guide"], ["プレイブック", "/playbook"], ["技術スタック", "/stack"], ["ライブラリ", "/library"], ["マニフェスト", "/manifesto"]] }
    ],
    footerRights: "© 2026 姚凯。All rights reserved.",
    footerNote: "A precise, multilingual personal website."
  },
  en: {
    brandSubtitle: "Creative Engineering",
    primaryNav: [
      ["Home", "/"],
      ["Work", "/projects"],
      ["Writing", "/blog"],
      ["Stack", "/stack"],
      ["About", "/about"],
      ["Contact", "/contact"]
    ],
    moreLabel: "More",
    moreGroups: [
      {
        title: "Explore",
        links: [
          ["Content Map", "/explore", "Browse work, writing, guides, and resources by goal"],
          ["Guides", "/guide", "Reusable development and product guides"],
          ["Resources", "/resources", "Tools, docs, and references"]
        ]
      },
      {
        title: "System",
        links: [
          ["Playbook", "/playbook", "Operating principles and project breakdowns"],
          ["Library", "/library", "Resources and tools I keep returning to"],
          ["VPS Notes", "/vps/docs", "Server and secure access notes"]
        ]
      },
      {
        title: "Personal",
        links: [
          ["Now", "/now", "What I am building and studying now"],
          ["Manifesto", "/manifesto", "Principles for craft, AI, and long-term work"]
        ]
      }
    ],
    searchLabel: "Search",
    searchShort: "Search",
    searchPlaceholder: "Search writing, projects, guides, resources...",
    searchLoading: "Preparing the content system...",
    searchEmpty: "No matching content found. Try another keyword.",
    contactCta: "Work together",
    mobileTitle: "Content System",
    mobileSubtitle: "Choose a path and keep exploring",
    mobileSearch: "Search writing, projects, guides",
    mobileContact: "Start a conversation",
    footerBadge: "Personal Digital Product",
    footerTitle: "I turn complex ideas into polished digital products with engineering, design, product thinking, and AI workflows.",
    footerContact: "Contact me",
    footerGroups: [
      { title: "Main", links: [["Work", "/projects"], ["Writing", "/blog"], ["About", "/about"], ["Contact", "/contact"]] },
      { title: "System", links: [["Guides", "/guide"], ["Playbook", "/playbook"], ["Stack", "/stack"], ["Library", "/library"], ["Manifesto", "/manifesto"]] }
    ],
    footerRights: "© 2026 Yaokai. All rights reserved.",
    footerNote: "Built as a precise, multilingual personal website."
  }
} satisfies Record<Locale, {
  brandSubtitle: string;
  primaryNav: string[][];
  moreLabel: string;
  moreGroups: { title: string; links: string[][] }[];
  searchLabel: string;
  searchShort: string;
  searchPlaceholder: string;
  searchLoading: string;
  searchEmpty: string;
  contactCta: string;
  mobileTitle: string;
  mobileSubtitle: string;
  mobileSearch: string;
  mobileContact: string;
  footerBadge: string;
  footerTitle: string;
  footerContact: string;
  footerGroups: { title: string; links: string[][] }[];
  footerRights: string;
  footerNote: string;
}>;
