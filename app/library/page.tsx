import { PageHeader } from "@/components/site/PageHeader";
import { ResourceExplorer } from "@/components/site/ResourceExplorer";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { getResources } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const libraryCopy = {
  zh: {
    metaTitle: "资源库 - 姚凯",
    metaDescription: "姚凯长期使用、参考和推荐的开发、设计、AI、产品与内容资源。",
    eyebrow: "Library",
    title: "一个面向创造者的高质量资源库。",
    description: "这里不是普通链接收藏，而是我在真实项目中反复使用、验证和参考的工具、文档、设计灵感、AI 工作流与工程资源。"
  },
  ja: {
    metaTitle: "リソース - 姚凱",
    metaDescription: "開発、デザイン、AI、プロダクト、文章づくりのために実際に使っているリソース。",
    eyebrow: "Library",
    title: "作る人のための、手元に置いておきたいリソース集。",
    description: "ただのリンク集ではありません。実際のプロジェクトで使い、何度も読み返し、判断の基準にしているツール、ドキュメント、デザイン参考、AI ワークフローをまとめています。"
  },
  en: {
    metaTitle: "Library - Yaokai",
    metaDescription: "Development, design, AI, product, and writing resources I actually use and revisit.",
    eyebrow: "Library",
    title: "A considered resource library for people who build.",
    description: "Not a random bookmark list. These are tools, docs, design references, AI workflows, and engineering resources I use, revisit, and test through real projects."
  }
} as const;

export async function generateMetadata() {
  const [locale, copyOverrides] = await Promise.all([getRequestLocale(), getCopyOverrides()]);
  const t = applyCopyOverrides(libraryCopy[locale], copyOverrides, `library.${locale}`);

  return createMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: "/library",
    locale
  });
}

export default async function LibraryPage() {
  const [locale, resources, copyOverrides] = await Promise.all([getRequestLocale(), getResources(), getCopyOverrides()]);
  const t = applyCopyOverrides(libraryCopy[locale], copyOverrides, `library.${locale}`);

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <section className="section-container py-16">
        <ResourceExplorer resources={resources} />
      </section>
    </>
  );
}
