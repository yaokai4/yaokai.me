import { AlertTriangle, BookOpen, CheckCircle2, FileText, FolderKanban, Inbox, Library, MessageSquare, Server, Settings } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const [
    articleCount,
    projectCount,
    guideCount,
    resourceCount,
    postCount,
    messageCount,
    publishedArticleCount,
    draftArticleCount,
    publishedGuideCount,
    draftGuideCount,
    missingArticleSeoCount,
    missingGuideSeoCount,
    unreadMessageCount,
    publicPostCount,
    recentArticles,
    recentProjects,
    recentPosts,
    recentMessages
  ] =
    await Promise.all([
      prisma.article.count(),
      prisma.project.count(),
      prisma.guide.count(),
      prisma.resource.count(),
      prisma.post.count(),
      prisma.message.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.guide.count({ where: { status: "PUBLISHED" } }),
      prisma.guide.count({ where: { status: "DRAFT" } }),
      prisma.article.count({ where: { status: "PUBLISHED", OR: [{ seoDescription: null }, { seoDescription: "" }, { seoTitle: null }, { seoTitle: "" }] } }),
      prisma.guide.count({ where: { status: "PUBLISHED", OR: [{ seoDescription: null }, { seoDescription: "" }, { seoTitle: null }, { seoTitle: "" }] } }),
      prisma.message.count({ where: { OR: [{ read: false }, { status: "UNREAD" }] } }),
      prisma.post.count({ where: { visible: true } }),
      prisma.article.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.project.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
    ]);
  const healthChecks = [
    {
      label: "文章 SEO",
      value: missingArticleSeoCount ? `${missingArticleSeoCount} 篇待补` : "已完善",
      ok: missingArticleSeoCount === 0,
      href: "/admin/blog"
    },
    {
      label: "指南 SEO",
      value: missingGuideSeoCount ? `${missingGuideSeoCount} 篇待补` : "已完善",
      ok: missingGuideSeoCount === 0,
      href: "/admin/guides"
    },
    {
      label: "未读留言",
      value: unreadMessageCount ? `${unreadMessageCount} 条` : "无待处理",
      ok: unreadMessageCount === 0,
      href: "/admin/messages"
    },
    {
      label: "公开动态",
      value: `${publicPostCount} 条`,
      ok: publicPostCount > 0,
      href: "/admin/posts"
    }
  ];
  const healthScore = Math.round((healthChecks.filter((item) => item.ok).length / healthChecks.length) * 100);

  return (
    <AdminLayout title="后台总览" description={`当前登录账号：${user.email}`}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="文章" value={articleCount} icon={FileText} />
        <AdminStatCard label="项目" value={projectCount} icon={FolderKanban} />
        <AdminStatCard label="指南" value={guideCount} icon={BookOpen} />
        <AdminStatCard label="资源" value={resourceCount} icon={Library} />
        <AdminStatCard label="动态" value={postCount} icon={MessageSquare} />
        <AdminStatCard label="留言" value={messageCount} icon={Inbox} />
      </div>

      <section className="mt-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">站点健康</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              已发布文章 {publishedArticleCount} 篇、草稿 {draftArticleCount} 篇；已发布指南 {publishedGuideCount} 篇、草稿 {draftGuideCount} 篇。
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className={`text-2xl font-black ${healthScore >= 90 ? "text-emerald-700" : healthScore >= 70 ? "text-amber-700" : "text-red-700"}`}>{healthScore}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Health</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {healthChecks.map((check) => (
            <Link key={check.label} href={check.href} className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 hover:bg-white">
              {check.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
              <span>
                <span className="block text-sm font-semibold text-slate-950">{check.label}</span>
                <span className="mt-1 block text-sm text-slate-500">{check.value}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="最近文章" href="/admin/blog">
          {recentArticles.map((article) => (
            <Row key={article.id} title={article.title} meta={formatDate(article.updatedAt)} badge={article.status} />
          ))}
        </Panel>
        <Panel title="最近项目" href="/admin/projects">
          {recentProjects.map((project) => (
            <Row key={project.id} title={project.title} meta={project.category} badge={project.featured ? "精选" : "普通"} />
          ))}
        </Panel>
        <Panel title="最近动态" href="/admin/posts">
          {recentPosts.map((post) => (
            <Row key={post.id} title={post.content} meta={formatDate(post.createdAt)} badge={post.visible ? "公开" : "隐藏"} />
          ))}
        </Panel>
        <Panel title="最近留言" href="/admin/messages">
          {recentMessages.map((message) => (
            <Row key={message.id} title={`${message.name}: ${message.content}`} meta={message.email} badge={message.read ? "已读" : "未读"} />
          ))}
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <QuickLink href="/admin/blog" icon={FileText} label="写文章" />
        <QuickLink href="/admin/projects" icon={FolderKanban} label="添加项目" />
        <QuickLink href="/admin/guides" icon={BookOpen} label="写指南" />
        <QuickLink href="/admin/resources" icon={Library} label="添加资源" />
        <QuickLink href="/admin/settings" icon={Settings} label="编辑设置" />
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 md:col-span-3">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-semibold text-slate-950">系统状态</p>
              <p className="mt-1 text-sm text-slate-500">Next.js、Prisma 和数据库访问均已在后台总览中正常响应。</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <Link href={href} className="text-sm text-slate-500 hover:text-slate-950">管理</Link>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Row({ title, meta, badge }: { title: string; meta: string; badge: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-slate-100 p-3">
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-medium text-slate-950">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{meta}</p>
      </div>
      <StatusBadge label={badge === "PUBLISHED" ? "已发布" : badge === "DRAFT" ? "草稿" : badge} tone={badge === "PUBLISHED" || badge === "精选" || badge === "公开" || badge === "已读" ? "success" : "warning"} />
    </div>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof FileText }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-md border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
