import { prisma } from "@/lib/prisma";
import { literaryArticles } from "@/lib/literary-articles";
import { parseJson, parseJsonArray } from "@/lib/utils";

export type SettingsMap = Record<string, string>;

export async function getSettings(): Promise<SettingsMap> {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function getSocials(settings: SettingsMap) {
  return parseJson<Array<{ label: string; href: string }>>(settings.socials, []);
}

export function normalizeArticle<T extends { tags: string; content: string } & Partial<Record<"relatedProjects" | "relatedGuides", string>>>(article: T) {
  return {
    ...article,
    tags: parseJsonArray(article.tags),
    relatedProjects: parseJsonArray(article.relatedProjects),
    relatedGuides: parseJsonArray(article.relatedGuides)
  };
}

export function normalizeProject<T extends { techStack: string } & Partial<Record<"screenshots" | "gallery" | "tags" | "responsibilities" | "keyChallenges" | "solutions" | "features" | "technicalHighlights" | "metrics" | "measurableResults" | "lessons" | "nextSteps", string>>>(project: T) {
  return {
    ...project,
    techStack: parseJsonArray(project.techStack),
    screenshots: parseJsonArray(project.screenshots),
    gallery: parseJsonArray(project.gallery),
    tags: parseJsonArray(project.tags),
    responsibilities: parseJsonArray(project.responsibilities),
    keyChallenges: parseJsonArray(project.keyChallenges),
    solutions: parseJsonArray(project.solutions),
    features: parseJsonArray(project.features),
    technicalHighlights: parseJsonArray(project.technicalHighlights),
    metrics: parseJsonArray(project.metrics),
    measurableResults: parseJsonArray(project.measurableResults),
    lessons: parseJsonArray(project.lessons),
    nextSteps: parseJsonArray(project.nextSteps)
  };
}

export function normalizePost<T extends { images: string }>(post: T) {
  return {
    ...post,
    images: parseJsonArray(post.images)
  };
}

export function normalizeGuide<T extends { tags: string } & Partial<Record<"steps" | "checklist", string>>>(guide: T) {
  return {
    ...guide,
    tags: parseJsonArray(guide.tags),
    steps: parseJsonArray(guide.steps),
    checklist: parseJsonArray(guide.checklist)
  };
}

export function normalizeResource<T extends { tags: string }>(resource: T) {
  return {
    ...resource,
    tags: parseJsonArray(resource.tags)
  };
}

export function normalizeContentCollection<T extends { itemIds: string }>(collection: T) {
  return {
    ...collection,
    itemIds: parseJsonArray(collection.itemIds)
  };
}

export async function getPublicArticles() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
  });

  const normalizedArticles = articles.map(normalizeArticle);
  const dbSlugs = new Set(normalizedArticles.map((article) => article.slug));
  const staticArticles = literaryArticles.filter((article) => !dbSlugs.has(article.slug)).map(normalizeArticle);

  return [...normalizedArticles, ...staticArticles].sort((a, b) => {
    if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
    const aPublished = a.publishedAt?.getTime() ?? a.createdAt.getTime();
    const bPublished = b.publishedAt?.getTime() ?? b.createdAt.getTime();
    return bPublished - aPublished;
  });
}

export async function getPublicProjects() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return projects.map(normalizeProject);
}

export async function getPublicPosts() {
  const posts = await prisma.post.findMany({
    where: { visible: true },
    orderBy: { createdAt: "desc" }
  });

  return posts.map(normalizePost);
}

export async function getPublicGuides() {
  const guides = await prisma.guide.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
  });

  return guides.map(normalizeGuide);
}

export async function getFeaturedGuides(limit = 4) {
  const guides = await prisma.guide.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit
  });

  return guides.map(normalizeGuide);
}

export async function getResources() {
  const resources = await prisma.resource.findMany({
    orderBy: [{ featured: "desc" }, { category: "asc" }, { createdAt: "desc" }]
  });

  return resources.map(normalizeResource);
}

export async function getContentCollections() {
  const collections = await prisma.contentCollection.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });

  return collections.map(normalizeContentCollection);
}

export async function getSkills() {
  return prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { level: "desc" }]
  });
}

export async function getTimelineItems() {
  return prisma.timelineItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
}
