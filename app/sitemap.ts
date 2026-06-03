import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [articles, projects, guides] = await Promise.all([
    prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.guide.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } })
  ]);

  const staticRoutes = ["/", "/explore", "/guide", "/library", "/resources", "/playbook", "/playbooks", "/stack", "/now", "/manifesto", "/about", "/projects", "/blog", "/posts", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date()
  }));

  return [
    ...staticRoutes,
    ...articles.map((article) => ({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: article.updatedAt
    })),
    ...guides.map((guide) => ({
      url: `${siteUrl}/guide/${guide.slug}`,
      lastModified: guide.updatedAt
    })),
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt
    }))
  ];
}
