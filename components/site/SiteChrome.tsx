"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { FluidGradientBackground } from "@/components/effects/FluidGradientBackground";
import { BackToTop } from "@/components/site/BackToTop";
import { Footer } from "@/components/site/Footer";
import { LocaleProvider } from "@/components/site/LocaleProvider";
import { Navbar } from "@/components/site/Navbar";
import { PageTransition } from "@/components/site/PageTransition";
import type { CopyOverrides } from "@/lib/copy-overrides";
import type { Locale } from "@/lib/i18n";

export function SiteChrome({ children, locale, copyOverrides = {} }: { children: React.ReactNode; locale: Locale; copyOverrides?: CopyOverrides }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  React.useEffect(() => {
    document.body.classList.toggle("admin-surface", isAdmin);
    return () => document.body.classList.remove("admin-surface");
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <LocaleProvider key={locale} initialLocale={locale} copyOverrides={copyOverrides}>
      <div className="site-shell">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <FluidGradientBackground />
        <Navbar />
        <main id="main-content" className="relative z-20">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </LocaleProvider>
  );
}
