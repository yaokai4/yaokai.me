"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminResourceManager, type FieldConfig } from "@/components/admin/AdminResourceManager";
import { formatDate } from "@/lib/utils";

type Item = Record<string, unknown> & { id: string };

const articleFields: FieldConfig[] = [
  { name: "title", label: "标题", type: "text", required: true },
  { name: "slug", label: "链接标识", type: "text", required: true },
  { name: "excerpt", label: "摘要", type: "textarea", required: true, full: true },
  { name: "content", label: "Markdown 正文", type: "markdown", required: true, full: true },
  { name: "coverImage", label: "封面图 URL", type: "text" },
  { name: "category", label: "分类", type: "text", required: true },
  { name: "tags", label: "标签", type: "tags" },
  { name: "status", label: "状态", type: "select", options: ["DRAFT", "PUBLISHED"] },
  { name: "featured", label: "精选", type: "checkbox" },
  { name: "pinned", label: "置顶", type: "checkbox" },
  { name: "seoTitle", label: "SEO 标题", type: "text" },
  { name: "seoDescription", label: "SEO 描述", type: "textarea", full: true },
  { name: "publishedAt", label: "发布时间", type: "datetime" }
];

const projectFields: FieldConfig[] = [
  { name: "title", label: "标题", type: "text", required: true },
  { name: "slug", label: "链接标识", type: "text", required: true },
  { name: "excerpt", label: "摘要", type: "textarea", required: true, full: true },
  { name: "content", label: "Markdown 正文", type: "markdown", required: true, full: true },
  { name: "coverImage", label: "封面图 URL", type: "text" },
  { name: "category", label: "分类", type: "text", required: true },
  { name: "techStack", label: "技术栈", type: "tags" },
  { name: "demoUrl", label: "演示 URL", type: "url" },
  { name: "githubUrl", label: "GitHub URL", type: "url" },
  { name: "role", label: "我的角色", type: "textarea", required: true, full: true },
  { name: "challenge", label: "核心挑战", type: "textarea", required: true, full: true },
  { name: "solution", label: "解决方案", type: "textarea", required: true, full: true },
  { name: "result", label: "最终结果", type: "textarea", required: true, full: true },
  { name: "featured", label: "精选", type: "checkbox" },
  { name: "sortOrder", label: "排序权重", type: "number" }
];

const postFields: FieldConfig[] = [
  { name: "content", label: "内容", type: "textarea", required: true, full: true },
  { name: "images", label: "图片 URL", type: "tags", full: true },
  { name: "visible", label: "公开可见", type: "checkbox" }
];

const guideFields: FieldConfig[] = [
  { name: "title", label: "标题", type: "text", required: true },
  { name: "slug", label: "链接标识", type: "text", required: true },
  { name: "excerpt", label: "摘要", type: "textarea", required: true, full: true },
  { name: "content", label: "Markdown 正文", type: "markdown", required: true, full: true },
  { name: "coverImage", label: "封面图 URL", type: "text" },
  { name: "category", label: "分类", type: "text", required: true },
  { name: "tags", label: "标签", type: "tags" },
  { name: "difficulty", label: "难度", type: "text", required: true },
  { name: "audience", label: "适合人群", type: "textarea", required: true, full: true },
  { name: "readingTime", label: "阅读时间", type: "text", required: true },
  { name: "status", label: "状态", type: "select", options: ["DRAFT", "PUBLISHED"] },
  { name: "featured", label: "精选", type: "checkbox" },
  { name: "publishedAt", label: "发布时间", type: "datetime" }
];

const resourceFields: FieldConfig[] = [
  { name: "title", label: "名称", type: "text", required: true },
  { name: "url", label: "链接", type: "url", required: true },
  { name: "description", label: "描述", type: "textarea", required: true, full: true },
  { name: "category", label: "分类", type: "text", required: true },
  { name: "tags", label: "标签", type: "tags" },
  { name: "reason", label: "推荐理由", type: "textarea", required: true, full: true },
  { name: "useCase", label: "使用场景", type: "textarea", required: true, full: true },
  { name: "featured", label: "精选", type: "checkbox" }
];

const nowFields: FieldConfig[] = [
  { name: "title", label: "标题", type: "text", required: true },
  { name: "description", label: "描述", type: "textarea", required: true, full: true },
  { name: "type", label: "类型", type: "text", required: true },
  { name: "status", label: "状态", type: "text", required: true },
  { name: "sortOrder", label: "排序权重", type: "number" }
];

const playbookFields: FieldConfig[] = [
  { name: "title", label: "名称", type: "text", required: true },
  { name: "slug", label: "链接标识", type: "text", required: true },
  { name: "scenario", label: "适用场景", type: "textarea", required: true, full: true },
  { name: "principles", label: "原则", type: "tags", full: true },
  { name: "steps", label: "步骤", type: "tags", full: true },
  { name: "example", label: "示例", type: "textarea", required: true, full: true },
  { name: "relatedLinks", label: "相关链接", type: "tags", full: true },
  { name: "featured", label: "精选", type: "checkbox" }
];

const manifestoFields: FieldConfig[] = [
  { name: "title", label: "标题", type: "text", required: true },
  { name: "content", label: "内容", type: "textarea", required: true, full: true },
  { name: "sortOrder", label: "排序权重", type: "number" },
  { name: "visible", label: "公开可见", type: "checkbox" }
];

function statusLabel(value: unknown) {
  if (value === "PUBLISHED") return "已发布";
  if (value === "DRAFT") return "草稿";
  return String(value);
}

export function BlogManager({ items }: { items: Item[] }) {
  return (
    <AdminResourceManager
      title="文章"
      endpoint="/api/blog"
      fields={articleFields}
      initialItems={items}
      filters={[
        { label: "已发布", key: "status", value: "PUBLISHED" },
        { label: "草稿", key: "status", value: "DRAFT" }
      ]}
      columns={[
        { key: "title", label: "标题", sortable: true, render: (item) => <span className="font-medium text-slate-950">{String(item.title)}</span> },
        { key: "category", label: "分类", sortable: true },
        { key: "status", label: "状态", render: (item) => <StatusBadge label={statusLabel(item.status)} tone={item.status === "PUBLISHED" ? "success" : "warning"} /> },
        { key: "featured", label: "精选", render: (item) => <StatusBadge label={item.featured ? "是" : "否"} tone={item.featured ? "success" : "default"} /> },
        { key: "updatedAt", label: "更新时间", sortable: true, render: (item) => formatDate(String(item.updatedAt)) }
      ]}
    />
  );
}

export function ProjectsManager({ items }: { items: Item[] }) {
  return (
    <AdminResourceManager
      title="项目"
      endpoint="/api/projects"
      fields={projectFields}
      initialItems={items}
      columns={[
        { key: "title", label: "标题", sortable: true, render: (item) => <span className="font-medium text-slate-950">{String(item.title)}</span> },
        { key: "category", label: "分类", sortable: true },
        { key: "featured", label: "精选", render: (item) => <StatusBadge label={item.featured ? "是" : "否"} tone={item.featured ? "success" : "default"} /> },
        { key: "sortOrder", label: "排序", sortable: true },
        { key: "updatedAt", label: "更新时间", sortable: true, render: (item) => formatDate(String(item.updatedAt)) }
      ]}
    />
  );
}

export function PostsManager({ items }: { items: Item[] }) {
  return (
    <AdminResourceManager
      title="动态"
      endpoint="/api/posts"
      fields={postFields}
      initialItems={items}
      filters={[
        { label: "公开", key: "visible", value: "true" },
        { label: "隐藏", key: "visible", value: "false" }
      ]}
      columns={[
        { key: "content", label: "内容", render: (item) => <span className="line-clamp-2">{String(item.content)}</span> },
        { key: "visible", label: "可见性", render: (item) => <StatusBadge label={item.visible ? "公开" : "隐藏"} tone={item.visible ? "success" : "warning"} /> },
        { key: "createdAt", label: "创建时间", sortable: true, render: (item) => formatDate(String(item.createdAt)) }
      ]}
    />
  );
}

export function GuidesManager({ items }: { items: Item[] }) {
  return (
    <AdminResourceManager
      title="指南"
      endpoint="/api/guides"
      fields={guideFields}
      initialItems={items}
      filters={[
        { label: "已发布", key: "status", value: "PUBLISHED" },
        { label: "草稿", key: "status", value: "DRAFT" }
      ]}
      columns={[
        { key: "title", label: "标题", sortable: true, render: (item) => <span className="font-medium text-slate-950">{String(item.title)}</span> },
        { key: "category", label: "分类", sortable: true },
        { key: "difficulty", label: "难度", sortable: true },
        { key: "status", label: "状态", render: (item) => <StatusBadge label={statusLabel(item.status)} tone={item.status === "PUBLISHED" ? "success" : "warning"} /> },
        { key: "featured", label: "精选", render: (item) => <StatusBadge label={item.featured ? "是" : "否"} tone={item.featured ? "success" : "default"} /> },
        { key: "updatedAt", label: "更新时间", sortable: true, render: (item) => formatDate(String(item.updatedAt)) }
      ]}
    />
  );
}

export function ResourcesManager({ items }: { items: Item[] }) {
  return (
    <AdminResourceManager
      title="资源"
      endpoint="/api/resources"
      fields={resourceFields}
      initialItems={items}
      columns={[
        { key: "title", label: "名称", sortable: true, render: (item) => <span className="font-medium text-slate-950">{String(item.title)}</span> },
        { key: "category", label: "分类", sortable: true },
        { key: "featured", label: "精选", render: (item) => <StatusBadge label={item.featured ? "是" : "否"} tone={item.featured ? "success" : "default"} /> },
        { key: "updatedAt", label: "更新时间", sortable: true, render: (item) => formatDate(String(item.updatedAt)) }
      ]}
    />
  );
}

export function NowManager({ items }: { items: Item[] }) {
  return (
    <AdminResourceManager
      title="当前状态"
      endpoint="/api/now"
      fields={nowFields}
      initialItems={items}
      columns={[
        { key: "title", label: "标题", sortable: true, render: (item) => <span className="font-medium text-slate-950">{String(item.title)}</span> },
        { key: "type", label: "类型", sortable: true },
        { key: "status", label: "状态", sortable: true },
        { key: "sortOrder", label: "排序", sortable: true },
        { key: "updatedAt", label: "更新时间", sortable: true, render: (item) => formatDate(String(item.updatedAt)) }
      ]}
    />
  );
}

export function PlaybooksManager({ items }: { items: Item[] }) {
  return (
    <AdminResourceManager
      title="方法论"
      endpoint="/api/playbooks"
      fields={playbookFields}
      initialItems={items}
      columns={[
        { key: "title", label: "名称", sortable: true, render: (item) => <span className="font-medium text-slate-950">{String(item.title)}</span> },
        { key: "scenario", label: "适用场景", render: (item) => <span className="line-clamp-2">{String(item.scenario)}</span> },
        { key: "featured", label: "精选", render: (item) => <StatusBadge label={item.featured ? "是" : "否"} tone={item.featured ? "success" : "default"} /> },
        { key: "updatedAt", label: "更新时间", sortable: true, render: (item) => formatDate(String(item.updatedAt)) }
      ]}
    />
  );
}

export function ManifestoManager({ items }: { items: Item[] }) {
  return (
    <AdminResourceManager
      title="宣言"
      endpoint="/api/manifesto"
      fields={manifestoFields}
      initialItems={items}
      filters={[
        { label: "公开", key: "visible", value: "true" },
        { label: "隐藏", key: "visible", value: "false" }
      ]}
      columns={[
        { key: "title", label: "标题", sortable: true, render: (item) => <span className="font-medium text-slate-950">{String(item.title)}</span> },
        { key: "visible", label: "可见性", render: (item) => <StatusBadge label={item.visible ? "公开" : "隐藏"} tone={item.visible ? "success" : "warning"} /> },
        { key: "sortOrder", label: "排序", sortable: true },
        { key: "updatedAt", label: "更新时间", sortable: true, render: (item) => formatDate(String(item.updatedAt)) }
      ]}
    />
  );
}
