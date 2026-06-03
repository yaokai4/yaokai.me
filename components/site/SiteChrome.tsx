"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { FluidGradientBackground } from "@/components/effects/FluidGradientBackground";
import { BackToTop } from "@/components/site/BackToTop";
import { Footer } from "@/components/site/Footer";
import { LocaleProvider } from "@/components/site/LocaleProvider";
import { Navbar } from "@/components/site/Navbar";
import { PageTransition } from "@/components/site/PageTransition";
import type { Locale } from "@/lib/i18n";

export function SiteChrome({ children, locale }: { children: React.ReactNode; locale: Locale }) {
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
    <LocaleProvider initialLocale={locale}>
      <div className="site-shell">
        <FluidGradientBackground />
        <Navbar />
        <main className="relative z-20">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </LocaleProvider>
  );
}
