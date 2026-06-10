# Amazon Linux 2023 部署指南

这份指南用于在 Amazon Linux 2023 上部署本项目，运行环境包含 Node.js LTS、pnpm、systemd 和 Nginx。当前默认目标是：

```txt
域名：yaokai.me
服务器：57.180.83.160
SSH 用户：ec2-user
SSH 私钥：/Users/yaokai/Desktop/it/ios/machiL.pem
远端目录：/var/www/yaokai.me
systemd 服务名：yaokai-me.service
端口：3000
```

## 0. 本地一键部署

在本地项目目录运行：

```bash
npm run deploy
```

脚本会自动完成：

- 本地打包项目，排除 `.env`、`.env.production`、本地数据库、`.next`、`node_modules`、备份目录和 Git 元数据。
- 上传到 `57.180.83.160`。
- 远端保留生产 `.env.production`、`prisma/production.db*` 和备份目录。
- 安装或检查 Node.js、pnpm、Nginx。
- 写入 `yaokai.me www.yaokai.me` 的 Nginx 反向代理。
- 安装依赖、生成 Prisma Client、应用迁移、运行种子数据、构建 Next.js。
- 启动或重载 systemd 服务 `yaokai-me.service`。
- 执行本机健康检查和公网入口提示。

如需同时签发 HTTPS 证书：

```bash
ENABLE_SSL=1 npm run deploy
```

如果 SSH key 路径不同：

```bash
EC2_KEY=/path/to/machiL.pem npm run deploy
```

## 1. 准备服务器

通过 SSH 登录服务器，安装基础运行环境：

```bash
chmod +x scripts/setup-server.sh
sudo DOMAIN="yaokai.me www.yaokai.me" APP_NAME=yaokai-me APP_DIR=/var/www/yaokai.me ./scripts/setup-server.sh
```

脚本会安装：

- git、curl、nginx、sqlite
- Node.js LTS
- 通过 Corepack 启用 pnpm
- systemd 应用服务
- 指向 `127.0.0.1:3000` 的 Nginx 反向代理
- `yaokai-me.service` 开机自启动配置

默认值：

```txt
APP_NAME=yaokai-me
APP_DIR=/var/www/yaokai.me
PORT=3000
DOMAIN=yaokai.me www.yaokai.me
```

## 2. 放置代码

把项目克隆或复制到应用目录：

```bash
cd /var/www
git clone <your-repo-url> yaokai.me
cd yaokai.me
```

如果是手动上传文件，请确认当前用户拥有该目录权限。

## 3. 配置环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```

关键配置：

```txt
DATABASE_URL="file:./production.db"
NEXT_PUBLIC_SITE_URL="https://yaokai.me"
JWT_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
ADMIN_EMAIL="admin@yaokai.me"
ADMIN_PASSWORD="replace-with-strong-password"
NODE_ENV="production"
PORT=3000
```

如果使用 PostgreSQL，请设置：

```txt
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

部署脚本会根据 `DATABASE_URL` 自动选择正确的 Prisma schema：

```txt
SQLite:      prisma/schema.prisma
PostgreSQL:  prisma/postgresql/schema.prisma
```

每种数据库都有自己的迁移目录，PostgreSQL 不会复用 SQLite 的迁移 SQL。

## 4. 首次部署

```bash
chmod +x scripts/*.sh
RUN_SEED=1 ./scripts/deploy-amazon-linux-2023.sh
```

脚本会执行：

- 检查 Node.js 和 pnpm
- 安装依赖
- 按 SQLite 或 PostgreSQL 选择正确 Prisma schema
- 生成 Prisma Client
- 应用迁移
- 当 `RUN_SEED=1` 时运行种子数据
- 构建 Next.js
- 启动或重载 systemd 服务 `yaokai-me.service`
- 校验并重载 Nginx

## 5. Nginx

初始化脚本会写入：

```txt
/etc/nginx/conf.d/yaokai-me.conf
```

常用命令：

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx
```

如果修改端口，请同时更新 `.env.production` 和 Nginx upstream 目标地址。

## 6. systemd 应用服务

常用命令：

```bash
sudo systemctl status yaokai-me --no-pager
sudo journalctl -u yaokai-me -n 100 --no-pager
sudo systemctl restart yaokai-me
```

## 7. 域名与 DNS

将域名 DNS 的 A 记录指向服务器公网 IP，然后设置：

```txt
NEXT_PUBLIC_SITE_URL="https://yaokai.me"
```

Nginx 的 `server_name` 也使用同一个域名。

## 8. HTTPS / SSL

如需自动签发 Let’s Encrypt 证书，可安装 Certbot：

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yaokai.me -d www.yaokai.me
```

Certbot 通常会自动安装续期任务，可用以下命令测试：

```bash
sudo certbot renew --dry-run
```

## 9. 后续更新

```bash
chmod +x scripts/update.sh
./scripts/update.sh
```

该脚本会执行 `git pull`、安装依赖、应用迁移、重新构建、重启 systemd 应用服务，并重载 Nginx。

## 10. 手动启动

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

## 11. 数据库备份

SQLite：

```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh .env.production
```

备份文件会写入：

```txt
backups/yaokai-me-YYYYMMDD-HHMMSS.db
```

PostgreSQL 请使用 `pg_dump`：

```bash
pg_dump "$DATABASE_URL" > backups/yaokai-me-$(date +%Y%m%d-%H%M%S).sql
```

## 12. 后台入口

公开页面不会展示后台链接，也不应把 `/admin` 暴露给访客。维护时手动访问：

```txt
https://yaokai.me/yaokai
```

访问 `/yaokai` 后会设置一次后台入口 Cookie，并进入登录流程。

## 13. 排错

- 应用返回 502：查看 `sudo journalctl -u yaokai-me -n 100 --no-pager`，确认应用监听在 `3000` 端口。
- Nginx 重载失败：运行 `sudo nginx -t`，检查 `/etc/nginx/conf.d/yaokai-me.conf`。
- 后台账号不存在：确认 `.env.production` 有后台账号配置，然后运行 `pnpm prisma db seed`。
- Prisma 数据库类型不匹配：运行 `./scripts/prepare-prisma-provider.sh .env.production --print`，确认当前选中的 schema。
- 静态资源缺失：重新运行 `pnpm build` 并重启 `yaokai-me.service`。
