import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const [articles, projects] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { title: true, slug: true, excerpt: true, category: true, tags: true },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
    }),
    prisma.project.findMany({
      select: { title: true, slug: true, excerpt: true, category: true, techStack: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
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
      }))
    ]
  });
}
