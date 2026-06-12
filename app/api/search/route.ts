import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const [articles, projects, guides, resources, playbooks] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { title: true, slug: true, excerpt: true, category: true, tags: true },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
    }),
    prisma.project.findMany({
      select: { title: true, slug: true, excerpt: true, category: true, techStack: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
    }),
    prisma.guide.findMany({
      where: { status: "PUBLISHED" },
      select: { title: true, slug: true, excerpt: true, category: true, tags: true, audience: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
    }),
    prisma.resource.findMany({
      select: { title: true, url: true, description: true, category: true, tags: true, useCase: true },
      orderBy: [{ featured: "desc" }, { category: "asc" }, { createdAt: "desc" }]
    }),
    prisma.playbook.findMany({
      select: { title: true, slug: true, scenario: true, principles: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    })
  ]);

  return NextResponse.json({
    items: [
      ...articles.map((item) => ({
        type: "文章",
        title: item.title,
        description: item.excerpt,
        href: `/blog/${item.slug}`,
        meta: [item.category, ...parseJsonArray(item.tags)].join(" ")
      })),
      ...projects.map((item) => ({
        type: "项目",
        title: item.title,
        description: item.excerpt,
        href: `/projects/${item.slug}`,
        meta: [item.category, ...parseJsonArray(item.techStack)].join(" ")
      })),
      ...guides.map((item) => ({
        type: "指南",
        title: item.title,
        description: item.excerpt,
        href: `/guide/${item.slug}`,
        meta: [item.category, item.audience, ...parseJsonArray(item.tags)].join(" ")
      })),
      ...resources.map((item) => ({
        type: "资源",
        title: item.title,
        description: item.description,
        href: item.url,
        external: true,
        meta: [item.category, item.useCase, ...parseJsonArray(item.tags)].join(" ")
      })),
      ...playbooks.map((item) => ({
        type: "方法论",
        title: item.title,
        description: item.scenario,
        href: `/playbook#${item.slug}`,
        meta: parseJsonArray(item.principles).join(" ")
      }))
    ]
  });
}
