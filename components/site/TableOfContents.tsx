"use client";

import * as React from "react";
import type { TocItem } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/LocaleProvider";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { siteCopy } from "@/lib/public-copy";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const { locale, copyOverrides } = useLocale();
  const t = React.useMemo(() => applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).common, [copyOverrides, locale]);
  const [activeId, setActiveId] = React.useState(items[0]?.id || "");

  React.useEffect(() => {
    if (!items.length) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-24% 0px -64% 0px", threshold: [0, 1] }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-auto rounded-md border border-[#DAE2EA] bg-white p-4 shadow-[0_1px_2px_rgba(15,45,78,0.04)] lg:block">
      <p className="text-sm font-semibold text-slate-950">{t.tableOfContents}</p>
      <nav className="mt-4 grid gap-2" aria-label={t.tableOfContentsAria}>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "rounded-md px-2 py-1 text-sm leading-6 text-slate-600 transition hover:bg-indigo-50/80 hover:text-indigo-700 focus-ring",
              activeId === item.id && "bg-indigo-50 text-indigo-800"
            )}
            style={{ paddingLeft: item.level === 3 ? 12 : 0 }}
            aria-current={activeId === item.id ? "location" : undefined}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
