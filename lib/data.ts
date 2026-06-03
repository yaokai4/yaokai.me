import { prisma } from "@/lib/prisma";
import { parseJson, parseJsonArray } from "@/lib/utils";

export type SettingsMap = Record<string, string>;

export async function getSettings(): Promise<SettingsMap> {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function getNowItems(settings: SettingsMap) {
  return parseJson<string[]>(settings.now, []);
}

export function getSocials(settings: SettingsMap) {
  return parseJson<Array<{ label: string; href: string }>>(settings.socials, []);
}

export function normalizeArticle<T extends { tags: string; content: string }>(article: T) {
  return {
    ...article,
    tags: parseJsonArray(article.tags)
  };
}

export function normalizeProject<T extends { techStack: string }>(project: T) {
  return {
    ...project,
    techStack: parseJsonArray(project.techStack)
  };
}

export function normalizePost<T extends { images: string }>(post: T) {
  return {
    ...post,
    images: parseJsonArray(post.images)
  };
}

export function normalizeGuide<T extends { tags: string }>(guide: T) {
  return {
    ...guide,
    tags: parseJsonArray(guide.tags)
  };
}

export function normalizeResource<T extends { tags: string }>(resource: T) {
  return {
    ...resource,
    tags: parseJsonArray(resource.tags)
  };
}

export function normalizePlaybook<T extends { principles: string; steps: string; relatedLinks: string }>(playbook: T) {
  return {
    ...playbook,
    principles: parseJsonArray(playbook.principles),
    steps: parseJsonArray(playbook.steps),
    relatedLinks: parseJsonArray(playbook.relatedLinks)
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

  return articles.map(normalizeArticle);
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

export async function getNowRecords() {
  return prisma.nowItem.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
  });
}

export async function getPlaybooks() {
  const playbooks = await prisma.playbook.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });

  return playbooks.map(normalizePlaybook);
}

export async function getManifestoItems() {
  return prisma.manifestoItem.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
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
