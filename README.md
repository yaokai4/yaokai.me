# 个人网站

这是一个全栈个人品牌网站：前台负责作品、文章、指南、资源库、方法论、Now、宣言和联系展示；后台负责内容管理；数据层使用 Prisma；接口带鉴权；并提供 SEO、站点地图、Amazon Linux 2023 一键部署脚本，以及 SQLite / PostgreSQL 两套数据库支持。

## 功能

- 明亮流体前台：流体渐变、玻璃质感、响应式导航和细腻交互状态。
- 页面包含：首页、探索、指南、资源库、方法论、Now、宣言、关于我、作品集、文章、动态、联系和 404。
- 项目案例包含分类、技术栈、角色、挑战、方案、结果、链接和相关推荐。
- Machi iOS 与 Machi Web 项目已作为真实案例加入作品、文章、指南、资源库、方法论和探索路线。
- 文章系统支持 Markdown、代码高亮、阅读时间、阅读进度和目录。
- 指南系统支持 Markdown、分类、标签、适合人群、难度和阅读时间。
- 动态流用于记录想法、更新和公告。
- 联系表单包含校验、Toast 反馈、入库保存和基础频率限制。
- 后台 CMS 管理文章、项目、动态、指南、资源、Now、方法论、宣言、留言和站点设置。
- 后台入口隐藏：公开页面不展示后台链接；手动访问 `/yaokai` 后才会进入登录流程。
- 登录使用 bcrypt 密码哈希和 HTTP-only JWT Cookie 会话。
- Prisma 模型与种子数据覆盖用户、文章、项目、动态、指南、资源、Now、方法论、宣言、内容路线、留言、站点设置、技能和时间线。
- SEO 元数据、Open Graph、Twitter Card、sitemap 和 robots 均已配置。
- 提供 Amazon Linux 2023 初始化、部署、更新、启动、SQLite 备份脚本，以及默认部署到 `yaokai.me` 的一键命令。

## 技术栈

- Next.js App Router、React、TypeScript
- Tailwind CSS、Framer Motion
- Three.js 与 React Three Fiber
- Prisma ORM，默认本地使用 SQLite
- 生产环境可通过专用 Prisma schema 和迁移使用 PostgreSQL
- bcryptjs、jose、Zod
- React Markdown、GFM 和代码高亮
- PM2 与 Nginx 用于生产运行

## 项目结构

```txt
app/                 Next.js 路由、页面、API、SEO 路由
components/site/     前台网站组件
components/admin/    后台 CMS 组件
components/ui/       通用 UI 基础组件
components/effects/  动画与 3D 视觉效果
lib/                 Prisma、鉴权、校验、SEO、Markdown、工具函数
prisma/              SQLite schema 与种子脚本
prisma/postgresql/   PostgreSQL schema 与迁移
scripts/             服务器初始化、部署、更新、启动、备份脚本
public/images/       公共视觉资源
backups/             SQLite 备份输出目录
```

## 本地开发

```bash
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

后台登录：

- 入口：[http://localhost:3000/yaokai](http://localhost:3000/yaokai)
- 邮箱：`ADMIN_EMAIL` 的值
- 密码：`ADMIN_PASSWORD` 的值

`.env.example` 默认值：

```txt
ADMIN_EMAIL="admin@yaokai.me"
ADMIN_PASSWORD="ChangeMe123!"
```

## 环境变量

```txt
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
JWT_SECRET="please-change-this-secret"
ADMIN_EMAIL="admin@yaokai.me"
ADMIN_PASSWORD="ChangeMe123!"
NODE_ENV="development"
PORT=3000
```

生产环境请使用足够长的随机 `JWT_SECRET`。种子脚本会读取 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`，用 bcrypt 哈希密码，并创建或更新后台用户。

## 生产构建

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
pnpm start
```

## 一键部署到 yaokai.me

默认部署配置：

```txt
域名：yaokai.me
服务器：52.194.191.244
SSH 用户：ec2-user
SSH 私钥：/Users/yaokai/Desktop/it/ios/Machi2.pem
远端目录：/var/www/yaokai.me
PM2 应用名：yaokai-me
端口：3000
```

本地运行：

```bash
npm run deploy
```

脚本会在本地打包项目并排除 `.env`、`.env.production`、本地数据库、`.next`、`node_modules`、备份目录和 Git 元数据；远端会保留生产 `.env.production`、`prisma/production.db*` 和备份目录，然后安装依赖、应用迁移、运行种子数据、构建、重启 PM2 和重载 Nginx。

如需首次同时申请 HTTPS 证书：

```bash
ENABLE_SSL=1 npm run deploy
```

如果 key 路径不同：

```bash
EC2_KEY=/path/to/Machi2.pem npm run deploy
```

## SQLite 与 PostgreSQL

默认 Prisma schema 使用 SQLite，本地开发可直接使用：

```txt
DATABASE_URL="file:./dev.db"
```

本地命令使用默认 SQLite schema：

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

如果生产环境使用 PostgreSQL，请在 `.env.production` 中把 `DATABASE_URL` 设置为 PostgreSQL 连接串。部署脚本会自动选择：

```txt
prisma/postgresql/schema.prisma
```

并执行：

```bash
pnpm prisma generate --schema prisma/postgresql/schema.prisma
pnpm prisma migrate deploy --schema prisma/postgresql/schema.prisma
```

可用以下命令查看当前会选择哪个 schema：

```bash
./scripts/prepare-prisma-provider.sh .env.production --print
```

## 常见问题

- `pnpm: command not found`：先运行 `corepack enable`，再运行 `corepack prepare pnpm@latest --activate`。
- 后台登录失败：设置 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 后，运行 `pnpm prisma db seed`。
- 切换数据库后出现错误：确认当前使用的是 SQLite schema，还是 `prisma/postgresql/schema.prisma`。
- 联系表单生产环境失败：确认 Nginx 已把请求转发到 `3000` 端口，且应用正在 PM2 中运行。
- 部署 SSH 失败：确认 `/Users/yaokai/Desktop/it/ios/Machi2.pem` 存在，并执行 `chmod 400 /Users/yaokai/Desktop/it/ios/Machi2.pem`。
