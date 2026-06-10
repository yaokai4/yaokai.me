import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ToastProvider } from "@/components/ui/Toast";
import { htmlLang } from "@/lib/i18n";
import { createMetadata, personJsonLd, professionalServiceJsonLd, websiteJsonLd } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

const rootMetadataCopy = {
  zh: {
    title: "姚凯 / Yaokai - Web Developer & Product-minded Builder",
    description: "姚凯的个人网站，展示 Web / 全栈开发作品、技术文章、项目复盘、内容系统与 AI 工作流。"
  },
  ja: {
    title: "姚凯 / Yaokai - Web Developer & Product-minded Builder",
    description: "姚凯の個人サイト。Web / フルスタック開発、プロジェクト事例、技術記事、コンテンツシステム、AI ワークフローを紹介します。"
  },
  en: {
    title: "Yaokai - Web Developer & Product-minded Builder",
    description: "Yaokai's personal website for Web and full-stack projects, writing, case studies, content systems, and AI-assisted workflows."
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
