import { PageHeader } from "@/components/site/PageHeader";
import { ProjectExplorer } from "@/components/site/ProjectExplorer";
import { getPublicProjects } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "作品集 - 姚凯",
  description: "展示项目背景、我的角色、解决方案与最终结果的精选作品集。",
  path: "/projects"
});

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <>
      <PageHeader
        eyebrow="作品集"
        title="让界面背后的思考和执行过程被看见。"
        description="按分类、技术栈和主题浏览项目。每个案例都会呈现背景、挑战、方案与结果，而不只是展示截图。"
      />
      <section className="section-container py-16">
        <ProjectExplorer projects={projects} />
      </section>
    </>
  );
}
