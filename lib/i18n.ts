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
    brandSubtitle: "Machi · Shangence 开发者",
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
    footerTitle: "两个在线产品的开发者。从想法、代码到部署运维，都自己来。",
    footerContact: "联系我",
    footerGroups: [
      { title: "导航", links: [["作品", "/projects"], ["文章", "/blog"], ["技术栈", "/stack"], ["关于", "/about"], ["联系", "/contact"]] },
      { title: "产品", links: [["Machi", "https://machicity.com"], ["Shangence 商衡", "https://machicity.life/ja"]] }
    ],
    footerRights: "© 2026 姚凯。保留所有权利。",
    footerNote: "用 Next.js 构建，跑在东京的一台小服务器上。"
  },
  ja: {
    brandSubtitle: "Machi · Shangence 開発者",
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
    footerTitle: "2つのプロダクトを一人で作り、運用しています。",
    footerContact: "連絡する",
    footerGroups: [
      { title: "ナビ", links: [["制作実績", "/projects"], ["記事", "/blog"], ["技術スタック", "/stack"], ["プロフィール", "/about"], ["連絡", "/contact"]] },
      { title: "プロダクト", links: [["Machi", "https://machicity.com"], ["Shangence 商衡", "https://machicity.life/ja"]] }
    ],
    footerRights: "© 2026 姚凯。All rights reserved.",
    footerNote: "Next.js で作り、東京の小さなサーバーで動いています。"
  },
  en: {
    brandSubtitle: "Builder of Machi & Shangence",
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
    footerTitle: "I build and run two products end to end.",
    footerContact: "Contact me",
    footerGroups: [
      { title: "Pages", links: [["Work", "/projects"], ["Writing", "/blog"], ["Stack", "/stack"], ["About", "/about"], ["Contact", "/contact"]] },
      { title: "Products", links: [["Machi", "https://machicity.com"], ["Shangence", "https://machicity.life/ja"]] }
    ],
    footerRights: "© 2026 Yaokai. All rights reserved.",
    footerNote: "Built with Next.js, running on a small server in Tokyo."
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
