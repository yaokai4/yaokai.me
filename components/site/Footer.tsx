"use client";

import { ArrowUpRight, Github, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/site/LocaleProvider";
import { shellCopy } from "@/lib/i18n";

export function Footer() {
  const { locale } = useLocale();
  const copy = shellCopy[locale];

  return (
    <footer className="relative z-20 px-4 pb-8 pt-10 sm:px-6">
      <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-md border border-white/76 bg-white/68 p-5 shadow-[0_22px_72px_rgba(71,85,105,0.12)] backdrop-blur-2xl md:p-7">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-white/66 px-3 py-2 text-xs font-black text-cyan-800 shadow-sm">
              <Sparkles className="h-4 w-4" />
              {copy.footerBadge}
            </div>
            <h2 className="mt-5 max-w-2xl text-balance text-3xl font-black leading-tight text-slate-950">
              {copy.footerTitle}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5">
                <Mail className="h-4 w-4" />
                {copy.footerContact}
              </Link>
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-white">
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {copy.footerGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-black text-slate-950">{group.title}</p>
                <div className="mt-3 grid gap-2">
                  {group.links.map(([label, href]) => (
                    <Link key={href} href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-cyan-700">
                      {label}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="aurora-line mt-8 h-px" />
        <div className="mt-5 flex flex-col gap-2 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.footerRights}</p>
          <p>{copy.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
