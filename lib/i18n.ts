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

export function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) return defaultLocale;
  const normalized = value.toLowerCase();
  if (normalized.startsWith("ja")) return "ja";
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("zh")) return "zh";
  return defaultLocale;
}

export const shellCopy = {
  zh: {
    brandSubtitle: "Creative Engineering",
    primaryNav: [
      ["首页", "/"],
      ["探索", "/explore"],
      ["指南", "/guide"],
      ["作品", "/projects"],
      ["文章", "/blog"],
      ["关于", "/about"],
      ["联系", "/contact"]
    ],
    moreLabel: "更多",
    moreNav: [
      ["Playbook", "/playbook", "做事方法论与判断框架"],
      ["Stack", "/stack", "技能地图与工具雷达"],
      ["Now", "/now", "当前正在构建和研究的事"],
      ["Library", "/library", "长期使用的资源与工具"],
      ["Manifesto", "/manifesto", "关于创造、AI 和长期主义的原则"]
    ],
    searchLabel: "搜索内容",
    searchShort: "搜索",
    searchPlaceholder: "搜索文章、项目、指南、资源、方法论...",
    searchLoading: "正在整理内容宇宙...",
    searchEmpty: "没有找到匹配内容，换个关键词试试。",
    contactCta: "合作联系",
    mobileTitle: "内容宇宙",
    mobileSubtitle: "选择一条路线继续探索",
    mobileSearch: "搜索文章、项目、指南",
    mobileContact: "开始合作沟通",
    footerBadge: "Personal Digital Product",
    footerTitle: "用技术、设计、产品思维与 AI 工作流，把复杂想法做成精致作品。",
    footerContact: "联系我",
    footerGroups: [
      { title: "探索", links: [["内容宇宙", "/explore"], ["指南库", "/guide"], ["作品集", "/projects"], ["文章", "/blog"]] },
      { title: "系统", links: [["Playbook", "/playbook"], ["Stack", "/stack"], ["Now", "/now"], ["Library", "/library"]] },
      { title: "个人品牌", links: [["About", "/about"], ["Manifesto", "/manifesto"], ["Contact", "/contact"]] }
    ],
    footerRights: "© 2026 姚凯。保留所有权利。",
    footerNote: "Built as a precise, multilingual personal brand OS."
  },
  ja: {
    brandSubtitle: "Creative Engineering",
    primaryNav: [
      ["ホーム", "/"],
      ["探索", "/explore"],
      ["ガイド", "/guide"],
      ["制作実績", "/projects"],
      ["記事", "/blog"],
      ["プロフィール", "/about"],
      ["連絡", "/contact"]
    ],
    moreLabel: "その他",
    moreNav: [
      ["Playbook", "/playbook", "判断基準と制作プロセス"],
      ["Stack", "/stack", "スキルマップとツールレーダー"],
      ["Now", "/now", "いま取り組んでいること"],
      ["Library", "/library", "長く使っている資料と道具"],
      ["Manifesto", "/manifesto", "創作、AI、長期主義についての原則"]
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
      { title: "探索", links: [["コンテンツ宇宙", "/explore"], ["ガイド", "/guide"], ["制作実績", "/projects"], ["記事", "/blog"]] },
      { title: "システム", links: [["Playbook", "/playbook"], ["Stack", "/stack"], ["Now", "/now"], ["Library", "/library"]] },
      { title: "ブランド", links: [["About", "/about"], ["Manifesto", "/manifesto"], ["Contact", "/contact"]] }
    ],
    footerRights: "© 2026 姚凯。All rights reserved.",
    footerNote: "A precise, multilingual personal brand OS."
  },
  en: {
    brandSubtitle: "Creative Engineering",
    primaryNav: [
      ["Home", "/"],
      ["Explore", "/explore"],
      ["Guides", "/guide"],
      ["Work", "/projects"],
      ["Writing", "/blog"],
      ["About", "/about"],
      ["Contact", "/contact"]
    ],
    moreLabel: "More",
    moreNav: [
      ["Playbook", "/playbook", "Operating principles and decision frameworks"],
      ["Stack", "/stack", "Skill map and tool radar"],
      ["Now", "/now", "What I am building and studying now"],
      ["Library", "/library", "Resources and tools I keep returning to"],
      ["Manifesto", "/manifesto", "Principles for craft, AI, and long-term work"]
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
      { title: "Explore", links: [["Content System", "/explore"], ["Guides", "/guide"], ["Work", "/projects"], ["Writing", "/blog"]] },
      { title: "System", links: [["Playbook", "/playbook"], ["Stack", "/stack"], ["Now", "/now"], ["Library", "/library"]] },
      { title: "Brand", links: [["About", "/about"], ["Manifesto", "/manifesto"], ["Contact", "/contact"]] }
    ],
    footerRights: "© 2026 Yaokai. All rights reserved.",
    footerNote: "Built as a precise, multilingual personal brand OS."
  }
} satisfies Record<Locale, {
  brandSubtitle: string;
  primaryNav: string[][];
  moreLabel: string;
  moreNav: string[][];
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
