import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createMetadata({ title, description, path = "/", image = "/images/og-cover.svg" }: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : absoluteUrl("/images/og-cover.svg");

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
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
    sameAs: ["https://github.com/", "https://www.linkedin.com/"],
    knowsAbout: ["全栈开发", "产品设计", "AI 工作流", "自动化"]
  };
}
