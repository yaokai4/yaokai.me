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
    brandSubtitle: "独立开发者 / 日本在住",
    primaryNav: [
      ["首页", "/"],
      ["作品", "/projects"],
      ["文章", "/blog"],
      ["技术栈", "/stack"],
      ["关于", "/about"]
    ],
    searchLabel: "搜索内容",
    searchShort: "搜索",
    searchPlaceholder: "搜索文章、项目、指南、资源...",
    searchLoading: "正在加载...",
    searchEmpty: "没有找到匹配内容，换个关键词试试。",
    contactCta: "联系我",
    mobileTitle: "菜单",
    mobileSubtitle: "选择一个页面",
    mobileSearch: "搜索全站内容",
    mobileContact: "联系我",
    footerTitle: "在日本独立做产品，也把开发、生活和判断写下来。",
    footerContact: "联系我",
    footerGroups: [
      { title: "导航", links: [["作品", "/projects"], ["文章", "/blog"], ["技术栈", "/stack"], ["关于", "/about"], ["联系", "/contact"]] },
      { title: "产品", links: [["Machi", "https://machicity.com"], ["Shangence 商衡", "https://shangence.com"]] }
    ],
    footerRights: "© 2026 Yao Kai. All rights reserved.",
    footerNote: "运行在东京的一台小小的 AWS 服务器上。"
  },
  ja: {
    brandSubtitle: "日本在住の個人開発者",
    primaryNav: [
      ["ホーム", "/"],
      ["制作実績", "/projects"],
      ["記事", "/blog"],
      ["技術スタック", "/stack"],
      ["プロフィール", "/about"]
    ],
    searchLabel: "検索",
    searchShort: "検索",
    searchPlaceholder: "記事、制作実績、ガイド、リソースを検索...",
    searchLoading: "読み込み中...",
    searchEmpty: "一致する内容が見つかりません。別のキーワードを試してください。",
    contactCta: "連絡する",
    mobileTitle: "メニュー",
    mobileSubtitle: "ページを選択",
    mobileSearch: "サイト内を検索",
    mobileContact: "連絡する",
    footerTitle: "日本で暮らしながら、プロダクトと日々の記録を少しずつ形にしています。",
    footerContact: "連絡する",
    footerGroups: [
      { title: "ナビ", links: [["制作実績", "/projects"], ["記事", "/blog"], ["技術スタック", "/stack"], ["プロフィール", "/about"], ["連絡", "/contact"]] },
      { title: "プロダクト", links: [["Machi", "https://machicity.com"], ["Shangence 商衡", "https://shangence.com"]] }
    ],
    footerRights: "© 2026 Yao Kai. All rights reserved.",
    footerNote: "東京の小さな AWS サーバーで動いています。"
  },
  en: {
    brandSubtitle: "Independent developer in Japan",
    primaryNav: [
      ["Home", "/"],
      ["Work", "/projects"],
      ["Writing", "/blog"],
      ["Stack", "/stack"],
      ["About", "/about"]
    ],
    searchLabel: "Search",
    searchShort: "Search",
    searchPlaceholder: "Search writing, work, guides, resources...",
    searchLoading: "Loading...",
    searchEmpty: "No matching content found. Try another keyword.",
    contactCta: "Contact me",
    mobileTitle: "Menu",
    mobileSubtitle: "Pick a page",
    mobileSearch: "Search the site",
    mobileContact: "Contact me",
    footerTitle: "Building product systems in Japan, and keeping notes along the way.",
    footerContact: "Contact me",
    footerGroups: [
      { title: "Pages", links: [["Work", "/projects"], ["Writing", "/blog"], ["Stack", "/stack"], ["About", "/about"], ["Contact", "/contact"]] },
      { title: "Products", links: [["Machi", "https://machicity.com"], ["Shangence", "https://shangence.com"]] }
    ],
    footerRights: "© 2026 Yao Kai. All rights reserved.",
    footerNote: "Running on a small AWS server in Tokyo."
  }
} satisfies Record<Locale, {
  brandSubtitle: string;
  primaryNav: string[][];
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
  footerTitle: string;
  footerContact: string;
  footerGroups: { title: string; links: string[][] }[];
  footerRights: string;
  footerNote: string;
}>;
