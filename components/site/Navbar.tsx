"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Mail, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useLocale } from "@/components/site/LocaleProvider";
import { CommandSearch } from "@/components/ui/CommandSearch";
import { PremiumDropdown } from "@/components/ui/PremiumDropdown";
import { localeLabels, locales, localeNames, shellCopy, stripLocaleFromPathname, withLocalePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const activePathname = stripLocaleFromPathname(pathname);
  const { locale, setLocale } = useLocale();
  const copy = shellCopy[locale];
  const primaryNav = copy.primaryNav.map(([label, href]) => ({ label, href }));
  const moreGroups = copy.moreGroups.map((group) => ({
    ...group,
    links: group.links.map(([label, href, description]) => ({ label, href, description }))
  }));
  const moreNav = moreGroups.flatMap((group) => group.links);
  const moreActive = moreNav.some((item) => isActive(activePathname, item.href));
  const [open, setOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [mobileExpanded, setMobileExpanded] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(copy.moreGroups.map((group) => [group.title, true]))
  );
  const switchLocale = React.useCallback((next: Locale) => {
    setOpen(false);
    setMoreOpen(false);
    setLocale(next);
    router.push(withLocalePath(pathname, next));
  }, [pathname, router, setLocale]);

  React.useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#DAE2EA] bg-white">
      <nav className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8">
        <Link href={withLocalePath("/", locale)} className="group inline-flex min-w-0 items-center gap-3 rounded-md px-1 py-1.5 focus-ring">
          <span className="font-serif text-lg font-semibold leading-none tracking-[0.22em] text-indigo-900">姚凱</span>
          <span className="hidden min-w-0 border-l border-[#DAE2EA] pl-3 sm:block">
            <span className="block text-[10px] font-bold uppercase leading-4 tracking-[0.3em] text-sky-600">Yao Kai</span>
            <span className="block text-[10px] font-semibold leading-4 tracking-wider text-slate-500">{copy.brandSubtitle}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={withLocalePath(item.href, locale)}
              onClick={() => setMoreOpen(false)}
              className={cn(
                "relative rounded-sm px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-900 focus-ring",
                isActive(activePathname, item.href) && "font-bold text-indigo-900"
              )}
              aria-current={isActive(activePathname, item.href) ? "page" : undefined}
            >
              {item.label}
              {isActive(activePathname, item.href) ? <span className="absolute inset-x-3 -bottom-[13px] h-[2px] bg-indigo-900" /> : null}
            </Link>
          ))}

          <PremiumDropdown
            open={moreOpen}
            onOpenChange={setMoreOpen}
            trigger={
              <button
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-900 focus-ring",
                  moreActive && "font-bold text-indigo-900"
                )}
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((value) => !value)}
              >
                {copy.moreLabel}
                <ChevronDown className={cn("h-4 w-4 transition", moreOpen && "rotate-180")} />
              </button>
            }
          >
            <div className="grid gap-2">
              {moreGroups.map((group) => (
                <div key={group.title} className="grid gap-1">
                  <p className="px-3 pt-1 text-[11px] font-black uppercase tracking-wide text-slate-400">{group.title}</p>
                  {group.links.map((item) => (
                    <Link
                      key={item.href}
                      href={withLocalePath(item.href, locale)}
                      role="menuitem"
                      onClick={() => setMoreOpen(false)}
                      className="group/item rounded-[14px] px-3 py-3 transition hover:bg-indigo-50/80 focus-ring"
                    >
                      <span className="flex items-center justify-between gap-3 text-sm font-bold text-slate-950">
                        {item.label}
                        <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-indigo-600" />
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </PremiumDropdown>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="grid h-10 w-10 place-items-center rounded-full border border-indigo-200 bg-white text-slate-600 transition hover:border-indigo-400 hover:text-indigo-900 focus-ring"
            aria-label={copy.searchLabel}
          >
            <Search className="h-4 w-4" />
          </button>
          <LanguageSwitcher locale={locale} onChange={switchLocale} />
          <Link href={withLocalePath("/contact", locale)} className="magnetic-button hidden h-10 items-center gap-2 rounded-full border border-indigo-900 bg-indigo-900 px-4 text-sm font-bold text-white shadow-[0_2px_10px_rgba(15,45,78,0.2)] transition hover:-translate-y-0.5 hover:bg-indigo-800 sm:inline-flex focus-ring">
            <Mail className="h-4 w-4" />
            {copy.contactCta}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-indigo-200 bg-white text-slate-700 transition hover:border-indigo-400 lg:hidden focus-ring"
            onClick={() => setOpen(true)}
            aria-label={copy.mobileTitle}
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <CommandSearch showButton={false} />

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] bg-slate-950/10 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              className="absolute right-3 top-3 grid w-[min(420px,calc(100%-24px))] gap-4 rounded-lg border border-[#DAE2EA] bg-white p-4 shadow-[0_10px_40px_rgba(15,45,78,0.14)]"
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
                <button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full bg-indigo-50 text-slate-600 focus-ring" aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={withLocalePath(item.href, locale)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "min-h-11 rounded-[14px] border border-[#DAE2EA] bg-white px-3 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white focus-ring",
                      isActive(activePathname, item.href) && "border-indigo-200 bg-indigo-50 text-indigo-900"
                    )}
                    aria-current={isActive(activePathname, item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="grid gap-2">
                {moreGroups.map((group) => {
                  const expanded = mobileExpanded[group.title] ?? true;
                  return (
                    <div key={group.title} className="rounded-[16px] border border-[#DAE2EA] bg-white p-2">
                      <button
                        type="button"
                        onClick={() => setMobileExpanded((current) => ({ ...current, [group.title]: !expanded }))}
                        className="flex min-h-11 w-full items-center justify-between rounded-[12px] px-3 text-sm font-black text-slate-950 focus-ring"
                        aria-expanded={expanded}
                      >
                        {group.title}
                        <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", expanded && "rotate-180")} />
                      </button>
                      {expanded ? (
                        <div className="grid gap-1 px-1 pb-1">
                          {group.links.map((item) => (
                            <Link
                              key={item.href}
                              href={withLocalePath(item.href, locale)}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "min-h-11 rounded-[12px] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-slate-950 focus-ring",
                                isActive(activePathname, item.href) && "bg-indigo-50 text-indigo-900"
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:hidden">
                {locales.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchLocale(item)}
                    className={cn(
                      "h-11 rounded-full border border-[#DAE2EA] bg-white text-xs font-black text-slate-600 shadow-sm focus-ring",
                      locale === item && "border-indigo-700 bg-indigo-700 text-white"
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
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#DAE2EA] bg-white text-sm font-bold text-slate-800 focus-ring"
                >
                  <Search className="h-4 w-4" />
                  {copy.mobileSearch}
                </button>
                <Link href={withLocalePath("/contact", locale)} className="magnetic-button inline-flex h-12 items-center justify-center gap-2 rounded-full border border-indigo-900 bg-indigo-900 text-sm font-bold text-white focus-ring">
                  <Mail className="h-4 w-4" />
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
    <div className="hidden items-center gap-1 rounded-full border border-indigo-200 bg-white p-1 sm:flex" aria-label="Language">
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "h-8 min-w-9 rounded-full px-2 text-xs font-black text-slate-500 transition hover:bg-white hover:text-slate-950 focus-ring",
            locale === item && "bg-indigo-700 text-white shadow-sm hover:bg-indigo-700 hover:text-white"
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
