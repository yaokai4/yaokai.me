import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { defaultLocale, localeAlternates, stripLocaleFromPathname, withLocalePath, type Locale } from "@/lib/i18n";

const siteUrl = siteConfig.url || "http://localhost:3000";
const openGraphLocale: Record<Locale, string> = {
  zh: "zh_CN",
  ja: "ja_JP",
  en: "en_US"
};

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  locale?: Locale;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createMetadata({ title, description, path = "/", image = "/images/og-cover.svg", locale = defaultLocale }: SeoInput): Metadata {
  const canonicalPath = withLocalePath(path, locale);
  const url = absoluteUrl(canonicalPath);
  const imageUrl = image ? absoluteUrl(image) : absoluteUrl("/images/og-cover.svg");
  const normalizedPath = stripLocaleFromPathname(path);
  const noindex =
    normalizedPath.startsWith("/vps") ||
    normalizedPath.startsWith("/admin") ||
    normalizedPath.startsWith("/api") ||
    normalizedPath.startsWith("/yaokai");
  const languages = Object.fromEntries(
    Object.entries(localeAlternates(path)).map(([locale, href]) => [locale, absoluteUrl(href)])
  );
  const alternateLocale = Object.entries(openGraphLocale)
    .filter(([key]) => key !== locale)
    .map(([, value]) => value);

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
      languages
    },
    keywords: ["姚凯", "Yao Kai", "Web Developer", "Full-stack Developer", "Next.js", "Spring Boot", "Japan IT"],
    icons: {
      icon: "/icon.svg",
      apple: "/icon.svg"
    },
    robots: {
      index: !noindex,
      follow: !noindex
    },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title,
      description,
      locale: openGraphLocale[locale],
      alternateLocale,
      images: [{ url: imageUrl, width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "姚凯",
    url: siteUrl,
    sameAs: siteConfig.socialLinks.map((item) => item.href),
    jobTitle: "Web / Full-stack Developer",
    knowsAbout: ["Web 开发", "全栈开发", "Next.js", "Java / Spring Boot", "数据库设计", "AI 工作流", "产品原型"]
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl
  };
}

export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    areaServed: ["Japan", "China", "Remote"],
    sameAs: siteConfig.socialLinks.map((item) => item.href)
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function contactPageJsonLd(path = "/contact") {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: absoluteUrl(path),
    name: "联系姚凯",
    mainEntity: personJsonLd()
  };
}

export function blogPostingJsonLd(article: {
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    url: absoluteUrl(`/blog/${article.slug}`),
    image: article.coverImage ? absoluteUrl(article.coverImage) : absoluteUrl("/images/og-cover.svg"),
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
    author: personJsonLd()
  };
}

export function creativeWorkJsonLd(project: {
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string | null;
  updatedAt?: Date | string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.excerpt,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: project.coverImage ? absoluteUrl(project.coverImage) : absoluteUrl("/images/og-cover.svg"),
    dateModified: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
    creator: personJsonLd()
  };
}

export function profilePageJsonLd(path = "/", locale: Locale = defaultLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(withLocalePath(path, locale)),
    mainEntity: personJsonLd()
  };
}
