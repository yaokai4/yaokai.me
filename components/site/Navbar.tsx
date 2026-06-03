"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { CommandPalette } from "@/components/site/CommandPalette";
import { useLocale } from "@/components/site/LocaleProvider";
import { localeLabels, locales, localeNames, shellCopy, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const copy = shellCopy[locale];
  const primaryNav = copy.primaryNav.map(([label, href]) => ({ label, href }));
  const moreNav = copy.moreNav.map(([label, href, description]) => ({ label, href, description }));
  const [open, setOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-3 rounded-md border border-white/78 bg-white/72 px-3 shadow-[0_16px_64px_rgba(71,85,105,0.13)] backdrop-blur-2xl">
        <Link href="/" className="group inline-flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 focus-ring">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/78 bg-gradient-to-br from-cyan-200 via-white to-fuchsia-100 text-sm font-black text-slate-950 shadow-sm">
            YK
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block text-sm font-black leading-4 text-slate-950">姚凯</span>
            <span className="block text-[11px] font-semibold leading-4 text-slate-500">{copy.brandSubtitle}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/66 hover:text-slate-950 focus-ring",
                isActive(pathname, item.href) && "bg-white/74 text-slate-950 shadow-sm"
              )}
            >
              {item.label}
              {isActive(pathname, item.href) ? <span className="absolute inset-x-3 -bottom-1 h-px rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400" /> : null}
            </Link>
          ))}

          <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
            <button
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/66 hover:text-slate-950 focus-ring"
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((value) => !value)}
              onFocus={() => setMoreOpen(true)}
            >
              {copy.moreLabel}
              <ChevronDown className={cn("h-4 w-4 transition", moreOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {moreOpen ? (
                <motion.div
                  className="absolute right-0 top-full w-80 pt-2"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  role="menu"
                >
                  <div className="grid gap-1 rounded-md border border-white/72 bg-white/88 p-2 shadow-[0_28px_90px_rgba(78,89,132,0.18)] backdrop-blur-2xl">
                    {moreNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setMoreOpen(false)}
                        className="group/item rounded-md px-3 py-3 transition hover:bg-cyan-50/80 focus-ring"
                      >
                        <span className="flex items-center justify-between gap-3 text-sm font-bold text-slate-950">
                          {item.label}
                          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-cyan-700" />
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="grid h-10 w-10 place-items-center rounded-md border border-white/70 bg-white/66 text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-950 focus-ring"
            aria-label={copy.searchLabel}
          >
            <Search className="h-4 w-4" />
          </button>
          <LanguageSwitcher locale={locale} onChange={setLocale} />
          <Link href="/contact" className="magnetic-button hidden h-10 items-center gap-2 rounded-md bg-gradient-to-r from-slate-950 via-cyan-950 to-violet-950 px-4 text-sm font-bold text-white shadow-[0_18px_54px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 sm:inline-flex focus-ring">
            <Sparkles className="h-4 w-4" />
            {copy.contactCta}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/70 bg-white/66 text-slate-700 shadow-sm transition hover:bg-white lg:hidden focus-ring"
            onClick={() => setOpen(true)}
            aria-label={copy.mobileTitle}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <CommandPalette showButton={false} />

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] bg-slate-950/18 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              className="absolute right-3 top-3 grid w-[min(390px,calc(100%-24px))] gap-4 rounded-md border border-white/72 bg-white/88 p-4 shadow-[0_28px_120px_rgba(78,89,132,0.24)] backdrop-blur-2xl"
              initial={{ opacity: 0, x: 18, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 18, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-950">{copy.mobileTitle}</p>
                  <p className="text-xs text-slate-500">{copy.mobileSubtitle}</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-slate-600 focus-ring" aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[...primaryNav, ...moreNav].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md border border-white/70 bg-white/60 px-3 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white focus-ring",
                      isActive(pathname, item.href) && "border-cyan-200 bg-cyan-50 text-cyan-800"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:hidden">
                {locales.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLocale(item)}
                    className={cn(
                      "h-11 rounded-md border border-white/70 bg-white/60 text-xs font-black text-slate-600 shadow-sm focus-ring",
                      locale === item && "border-slate-950 bg-slate-950 text-white"
                    )}
                  >
                    {localeNames[item]}
                  </button>
                ))}
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new Event("open-command-palette"));
                  }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-cyan-200/70 bg-white/70 text-sm font-bold text-slate-800 focus-ring"
                >
                  <Search className="h-4 w-4" />
                  {copy.mobileSearch}
                </button>
                <Link href="/contact" className="magnetic-button inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-slate-950 via-cyan-950 to-violet-950 text-sm font-bold text-white focus-ring">
                  <Sparkles className="h-4 w-4" />
                  {copy.mobileContact}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className="hidden items-center rounded-md border border-white/70 bg-white/60 p-1 shadow-sm sm:flex" aria-label="Language">
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "h-8 min-w-9 rounded px-2 text-xs font-black text-slate-500 transition hover:bg-white hover:text-slate-950 focus-ring",
            locale === item && "bg-slate-950 text-white shadow-sm hover:bg-slate-950 hover:text-white"
          )}
          title={localeNames[item]}
          aria-pressed={locale === item}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  );
}
