import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function stringifyArray(value: unknown): string {
  if (Array.isArray(value)) {
    return JSON.stringify(value.map(String).filter(Boolean));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "[]";
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return JSON.stringify(parsed.map(String).filter(Boolean));
    } catch {
      return JSON.stringify(
        trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      );
    }
  }

  return "[]";
}

export function parseJson<T>(value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const intlDateLocales: Record<Locale, string> = {
  zh: "zh-CN",
  ja: "ja-JP",
  en: "en"
};

export function formatDate(date?: Date | string | null, locale: Locale = "zh") {
  if (!date) return "";

  return new Intl.DateTimeFormat(intlDateLocales[locale], {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(date));
}

export function readingTime(content: string, locale: Locale = "zh") {
  const cjkChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const latinWords = content
    .replace(/[\u4e00-\u9fa5]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(latinWords / 220 + cjkChars / 320));
  if (locale === "en") return `${minutes} min read`;
  if (locale === "ja") return `約 ${minutes} 分で読めます`;
  return `约 ${minutes} 分钟阅读`;
}

export function formatStoredReadingTime(value: string, locale: Locale = "zh") {
  const minutes = Number(value.match(/\d+/)?.[0]);
  if (!minutes) return value;
  if (locale === "en") return `${minutes} min read`;
  if (locale === "ja") return `約 ${minutes} 分で読めます`;
  return `约 ${minutes} 分钟阅读`;
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
