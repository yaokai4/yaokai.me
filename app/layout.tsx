import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ToastProvider } from "@/components/ui/Toast";
import { htmlLang } from "@/lib/i18n";
import { createMetadata, personJsonLd } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

export const metadata: Metadata = createMetadata({
  title: "姚凯 - 全栈创作者",
  description: "姚凯的个人网站，记录作品、文章、动态与 AI 辅助产品实践。"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050816"
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
      </body>
    </html>
  );
}
