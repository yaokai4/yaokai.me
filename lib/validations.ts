import { z } from "zod";

export const loginSchema = z.object({
  account: z.string().trim().min(1, "请输入账号。"),
  password: z.string().min(6, "密码至少需要 6 个字符。")
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "当前密码至少需要 6 个字符。"),
  newPassword: z.string().min(10, "新密码至少需要 10 个字符。")
});

export const articleSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "链接标识不能为空").regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, "链接标识只能包含中文、英文、数字和连字符。"),
  excerpt: z.string().min(1, "摘要不能为空"),
  content: z.string().min(1, "正文不能为空"),
  coverImage: z.string().optional().nullable(),
  category: z.string().min(1, "分类不能为空"),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable()
});

export const projectSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "链接标识不能为空").regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, "链接标识只能包含中文、英文、数字和连字符。"),
  excerpt: z.string().min(1, "摘要不能为空"),
  content: z.string().min(1, "正文不能为空"),
  coverImage: z.string().optional().nullable(),
  category: z.string().min(1, "分类不能为空"),
  techStack: z.union([z.array(z.string()), z.string()]).optional(),
  demoUrl: z.string().url("请输入有效演示链接。").optional().or(z.literal("")).nullable(),
  githubUrl: z.string().url("请输入有效 GitHub 链接。").optional().or(z.literal("")).nullable(),
  role: z.string().min(1, "角色说明不能为空"),
  challenge: z.string().min(1, "核心挑战不能为空"),
  solution: z.string().min(1, "解决方案不能为空"),
  result: z.string().min(1, "最终结果不能为空"),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0)
});

export const postSchema = z.object({
  content: z.string().min(1, "内容不能为空"),
  images: z.union([z.array(z.string()), z.string()]).optional(),
  visible: z.boolean().default(true)
});

export const messageSchema = z.object({
  name: z.string().min(2, "姓名至少需要 2 个字符。").max(80, "姓名不能超过 80 个字符。"),
  email: z.string().email("请输入有效邮箱。"),
  content: z.string().min(10, "留言至少需要 10 个字符。").max(2000, "留言不能超过 2000 个字符。")
});

export const messageUpdateSchema = z.object({
  read: z.boolean()
});

export const settingsSchema = z.record(z.string(), z.string());

export const guideSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "链接标识不能为空").regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, "链接标识只能包含中文、英文、数字和连字符。"),
  excerpt: z.string().min(1, "摘要不能为空"),
  content: z.string().min(1, "正文不能为空"),
  coverImage: z.string().optional().nullable(),
  category: z.string().min(1, "分类不能为空"),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  difficulty: z.string().min(1, "难度不能为空"),
  audience: z.string().min(1, "适合人群不能为空"),
  readingTime: z.string().min(1, "阅读时间不能为空"),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.string().optional().nullable()
});

export const resourceSchema = z.object({
  title: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效链接。"),
  description: z.string().min(1, "描述不能为空"),
  category: z.string().min(1, "分类不能为空"),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  reason: z.string().min(1, "推荐理由不能为空"),
  useCase: z.string().min(1, "使用场景不能为空"),
  featured: z.boolean().default(false)
});

export const nowItemSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空"),
  type: z.string().min(1, "类型不能为空"),
  status: z.string().min(1, "状态不能为空"),
  sortOrder: z.coerce.number().int().default(0)
});

export const playbookSchema = z.object({
  title: z.string().min(1, "名称不能为空"),
  slug: z.string().min(1, "链接标识不能为空").regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, "链接标识只能包含中文、英文、数字和连字符。"),
  scenario: z.string().min(1, "适用场景不能为空"),
  principles: z.union([z.array(z.string()), z.string()]).optional(),
  steps: z.union([z.array(z.string()), z.string()]).optional(),
  example: z.string().min(1, "示例不能为空"),
  relatedLinks: z.union([z.array(z.string()), z.string()]).optional(),
  featured: z.boolean().default(false)
});

export const manifestoItemSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  content: z.string().min(1, "内容不能为空"),
  sortOrder: z.coerce.number().int().default(0),
  visible: z.boolean().default(true)
});
