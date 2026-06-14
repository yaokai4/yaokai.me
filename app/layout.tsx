import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ToastProvider } from "@/components/ui/Toast";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { htmlLang } from "@/lib/i18n";
import { createMetadata, personJsonLd, professionalServiceJsonLd, websiteJsonLd } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";
import { rootMetadataCopy } from "@/lib/site-copy-defaults";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const copy = applyCopyOverrides(rootMetadataCopy, copyOverrides, "root")[locale];

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
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);

  return (
    <html lang={htmlLang[locale]}>
      <body className="font-sans antialiased">
        <ToastProvider>
          <SiteChrome locale={locale} copyOverrides={copyOverrides}>{children}</SiteChrome>
        </ToastProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([personJsonLd(), websiteJsonLd(), professionalServiceJsonLd()]) }}
        />
      </body>
    </html>
  );
}
