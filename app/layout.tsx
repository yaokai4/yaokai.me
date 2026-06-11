import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ToastProvider } from "@/components/ui/Toast";
import { htmlLang } from "@/lib/i18n";
import { createMetadata, personJsonLd, professionalServiceJsonLd, websiteJsonLd } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

const rootMetadataCopy = {
  zh: {
    title: "姚凯 / Yaokai - Machi 与 Shangence 商衡的开发者",
    description: "姚凯的个人网站。展示 Machi、Shangence 商衡、yaokai.me、公开 GitHub 项目、简历和开发笔记。"
  },
  ja: {
    title: "姚凯 / Yaokai - Machi と Shangence 商衡の開発者",
    description: "姚凱の個人サイト。Machi、Shangence 商衡、yaokai.me、公開 GitHub プロジェクト、職務経歴、開発メモを掲載。"
  },
  en: {
    title: "Yaokai - Builder of Machi and Shangence",
    description: "Yaokai's personal site for Machi, Shangence, yaokai.me, public GitHub projects, resume and development notes."
  }
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = rootMetadataCopy[locale];

  return createMetadata({
    title: copy.title,
    description: copy.description,
    locale
  });
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();

  return (
    <html lang={htmlLang[locale]}>
      <body className="font-sans antialiased">
        <ToastProvider>
          <SiteChrome locale={locale}>{children}</SiteChrome>
        </ToastProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([personJsonLd(), websiteJsonLd(), professionalServiceJsonLd()]) }}
        />
      </body>
    </html>
  );
}
