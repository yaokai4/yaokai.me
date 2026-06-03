import type { TocItem } from "@/lib/markdown";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null;

  return (
    <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-auto rounded-md border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur lg:block">
      <p className="text-sm font-semibold text-slate-950">目录</p>
      <nav className="mt-4 grid gap-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="text-sm leading-6 text-slate-600 transition hover:text-cyan-700"
            style={{ paddingLeft: item.level === 3 ? 12 : 0 }}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
