"use client";

import { ArrowUpRight, Github, Linkedin, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { isUsableEmail, siteConfig } from "@/config/site.config";
import { useLocale } from "@/components/site/LocaleProvider";
import { shellCopy, withLocalePath } from "@/lib/i18n";

export function Footer() {
  const { locale } = useLocale();
  const copy = shellCopy[locale];
  const email = isUsableEmail(siteConfig.contactEmail) ? siteConfig.contactEmail : "";
  const socialLinks = siteConfig.socialLinks.slice(0, 3);

  return (
    <footer className="relative z-20 border-t border-slate-900/10 bg-white/76 px-5 py-10 backdrop-blur-xl sm:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.85fr_0.85fr]">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/70 px-3 py-2 text-xs font-black text-indigo-700">
              <Sparkles className="h-4 w-4" />
              姚凯 Creative Engineering
            </div>
            <p className="mt-5 text-base font-bold leading-7 text-slate-950">
              {copy.footerTitle}
            </p>
          </div>

          {copy.footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-black text-slate-950">{group.title}</p>
              <div className="mt-3 grid gap-2">
                {group.links.map(([label, href]) => (
                  <Link key={href} href={withLocalePath(href, locale)} className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-semibold text-slate-500 transition hover:text-indigo-700 focus-ring">
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-sm font-black text-slate-950">Social</p>
            <div className="mt-3 grid gap-2">
              {socialLinks.map((social) => (
                <a key={social.href} href={social.href} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-slate-500 transition hover:text-indigo-700 focus-ring">
                  {social.label === "GitHub" ? <Github className="h-4 w-4" /> : social.label === "LinkedIn" ? <Linkedin className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  {social.label}
                </a>
              ))}
              {email ? (
                <a href={`mailto:${email}`} className="inline-flex w-fit items-center gap-2 break-all rounded-sm text-sm font-semibold text-slate-500 transition hover:text-indigo-700 focus-ring">
                  <Mail className="h-4 w-4 shrink-0" />
                  {email}
                </a>
              ) : (
                <Link href={withLocalePath("/contact", locale)} className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-slate-500 transition hover:text-indigo-700 focus-ring">
                  <Mail className="h-4 w-4" />
                  {copy.footerContact}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-900/10 pt-5 flex flex-col gap-2 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.footerRights}</p>
          <p>{copy.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
