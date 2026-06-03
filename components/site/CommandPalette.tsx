"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Command, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useLocale } from "@/components/site/LocaleProvider";
import { shellCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SearchItem = {
  type: string;
  title: string;
  description: string;
  href: string;
  meta: string;
  external?: boolean;
};

export function CommandPalette({ showButton = true }: { showButton?: boolean }) {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = shellCopy[locale];
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<SearchItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onOpen = () => {
      setActiveIndex(0);
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveIndex(0);
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("open-command-palette", onOpen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("open-command-palette", onOpen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    window.requestAnimationFrame(() => inputRef.current?.focus());
    if (items.length) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });
    fetch("/api/search")
      .then((response) => response.json())
      .then((data: { items?: SearchItem[] }) => {
        if (!cancelled) setItems(data.items || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items.length, open]);

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items.slice(0, 10);
    return items
      .filter((item) => `${item.type} ${item.title} ${item.description} ${item.meta}`.toLowerCase().includes(term))
      .slice(0, 12);
  }, [items, query]);

  function openItem(item: SearchItem) {
    setOpen(false);
    setQuery("");
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(item.href);
  }

  const grouped = React.useMemo(() => {
    return filtered.reduce<Array<[string, SearchItem[]]>>((groups, item) => {
      const group = groups.find(([type]) => type === item.type);
      if (group) group[1].push(item);
      else groups.push([item.type, [item]]);
      return groups;
    }, []);
  }, [filtered]);

  return (
    <>
      {showButton ? (
        <button
          type="button"
          onClick={() => {
            setActiveIndex(0);
            setOpen(true);
          }}
          className="hidden h-10 items-center gap-2 rounded-md border border-white/70 bg-white/70 px-3 text-sm text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950 lg:inline-flex"
        >
          <Search className="h-4 w-4" />
          {copy.searchShort}
          <span className="ml-1 inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
            <Command className="h-3 w-3" />K
          </span>
        </button>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-start bg-slate-950/18 px-4 pt-24 backdrop-blur-sm md:pt-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              className="mx-auto w-full max-w-2xl overflow-hidden rounded-md border border-white/75 bg-white/88 shadow-[0_32px_120px_rgba(96,110,170,0.28)] backdrop-blur-2xl"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center gap-3 border-b border-slate-200/70 px-4 py-3">
                <Search className="h-5 w-5 text-cyan-600" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setActiveIndex(0);
                    setQuery(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
                    }
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      setActiveIndex((index) => Math.max(index - 1, 0));
                    }
                    if (event.key === "Enter" && filtered[activeIndex]) {
                      event.preventDefault();
                      openItem(filtered[activeIndex]);
                    }
                  }}
                  placeholder={copy.searchPlaceholder}
                  className="h-11 min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                />
                <button type="button" aria-label="Close search" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[62vh] overflow-y-auto p-2">
                {loading ? <p className="px-3 py-8 text-center text-sm text-slate-500">{copy.searchLoading}</p> : null}
                {!loading && !filtered.length ? <p className="px-3 py-8 text-center text-sm text-slate-500">{copy.searchEmpty}</p> : null}
                <div className="grid gap-3">
                  {grouped.map(([type, groupItems]) => (
                    <div key={type} className="grid gap-1">
                      <p className="px-3 pt-2 text-[11px] font-black uppercase text-slate-400">{type}</p>
                      {groupItems.map((item) => {
                        const itemIndex = filtered.findIndex((candidate) => candidate.type === item.type && candidate.title === item.title && candidate.href === item.href);
                        const className = cn(
                          "group relative grid gap-1 rounded-md px-3 py-3 transition hover:bg-cyan-50/80",
                          item.external && "pr-10",
                          activeIndex === itemIndex && "bg-cyan-50/90 ring-1 ring-cyan-200/70"
                        );
                    const content = (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-slate-950">{item.title}</span>
                          <span className="rounded-md border border-cyan-200/70 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-cyan-700">{item.type}</span>
                        </div>
                        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>
                      </>
                    );

                    return item.external ? (
                      <a key={`${item.type}-${item.title}`} href={item.href} target="_blank" rel="noreferrer" className={className} onClick={() => setOpen(false)}>
                        {content}
                        <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      </a>
                    ) : (
                      <Link key={`${item.type}-${item.title}`} href={item.href} className={className} onClick={() => setOpen(false)}>
                        {content}
                      </Link>
                    );
                  })}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
