import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales, withLocalePath } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [articles, projects, guides] = await Promise.all([
    prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.guide.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } })
  ]);

  const localize = (path: string, lastModified: Date) =>
    locales.map((locale) => ({
      url: `${siteUrl}${withLocalePath(path, locale)}`,
      lastModified,
      alternates: {
        languages: Object.fromEntries(locales.map((item) => [item === "zh" ? "zh-CN" : item === "ja" ? "ja-JP" : "en", `${siteUrl}${withLocalePath(path, item)}`]))
      }
    }));

  const staticRoutes = ["/", "/projects", "/blog", "/about", "/contact", "/explore", "/guide", "/playbook", "/stack", "/library", "/now", "/manifesto"].flatMap((path) =>
    localize(path, new Date())
  );

  return [
    ...staticRoutes,
    ...articles.flatMap((article) => localize(`/blog/${article.slug}`, article.updatedAt)),
    ...guides.flatMap((guide) => localize(`/guide/${guide.slug}`, guide.updatedAt)),
    ...projects.flatMap((project) => localize(`/projects/${project.slug}`, project.updatedAt))
  ];
}
