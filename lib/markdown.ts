import { readingTime, slugify } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function extractToc(markdown: string): TocItem[] {
  const seen = new Map<string, number>();

  return markdown
    .split("\n")
    .map((line) => {
      const match = /^(##|###)\s+(.+)$/.exec(line.trim());
      if (!match) return null;

      const text = match[2].replace(/[#*_`]/g, "").trim();
      const base = slugify(text);
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);

      return {
        id: count ? `${base}-${count}` : base,
        text,
        level: match[1].length
      };
    })
    .filter((item): item is TocItem => Boolean(item));
}

export function getReadingTime(markdown: string, locale: Locale = "zh") {
  return readingTime(markdown, locale);
}
