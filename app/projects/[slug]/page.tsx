import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard, GlowCard } from "@/components/site/GlassCard";
import { MarkdownRenderer } from "@/components/site/MarkdownRenderer";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import { normalizeProject } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return {};

  return createMetadata({
    title: `${project.title} - 项目`,
    description: project.excerpt,
    path: `/projects/${project.slug}`,
    image: project.coverImage
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const rawProject = await prisma.project.findUnique({ where: { slug } });
  if (!rawProject) notFound();

  const project = normalizeProject(rawProject);
  const all = (await prisma.project.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })).map(normalizeProject);
  const index = all.findIndex((item) => item.id === project.id);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const related = all.filter((item) => item.id !== project.id).slice(0, 2);

  return (
    <>
      <ReadingProgress />
      <section className="section-container pt-32">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-cyan-700">
          <ArrowLeft className="h-4 w-4" />
          返回作品集
        </Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Badge className="mb-5">{project.category}</Badge>
            <h1 className="text-balance text-5xl font-black leading-tight text-slate-950 md:text-7xl">{project.title}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">{project.excerpt}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.demoUrl ? (
                <Link href={project.demoUrl} target="_blank">
                  <Button>
                    <ExternalLink className="h-4 w-4" />
                    在线演示
                  </Button>
                </Link>
              ) : null}
              {project.githubUrl ? (
                <Link href={project.githubUrl} target="_blank">
                  <Button variant="secondary">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
          <GlassCard>
            <p className="text-sm font-semibold text-slate-950">技术栈</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="section-container grid gap-5 py-16 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["我的角色", project.role],
          ["核心挑战", project.challenge],
          ["解决方案", project.solution],
          ["最终结果", project.result]
        ].map(([title, value]) => (
          <GlowCard key={title}>
            <p className="text-sm font-medium text-cyan-700">{title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{value}</p>
          </GlowCard>
        ))}
      </section>

      <section className="section-container grid gap-10 pb-16 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="premium-glass-card rounded-md p-6 md:p-8">
          <MarkdownRenderer content={project.content} />
        </article>
        <aside className="grid content-start gap-4">
          {previous ? (
            <Link href={`/projects/${previous.slug}`} className="premium-glass-card rounded-md p-4 text-sm text-slate-600">
              <span className="font-bold text-slate-500">上一个项目</span>
              <p className="mt-2 font-black text-slate-950">{previous.title}</p>
            </Link>
          ) : null}
          {next ? (
            <Link href={`/projects/${next.slug}`} className="premium-glass-card rounded-md p-4 text-sm text-slate-600">
              <span className="font-bold text-slate-500">下一个项目</span>
              <p className="mt-2 font-black text-slate-950">{next.title}</p>
            </Link>
          ) : null}
        </aside>
      </section>

      {related.length ? (
        <section className="section-container pb-24">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-950">相关推荐</h2>
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700">
              全部项目
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {related.map((item) => (
              <ProjectCard key={item.id} project={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
