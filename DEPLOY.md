# yaokai.me 部署文档

最后更新：2026-06-04

这份文档记录 `yaokai.me` 的生产部署、验证、回滚和日常维护流程。当前部署方式是本地打包项目，通过 SSH 上传到 Amazon Linux 2023 服务器，并在远端使用 pnpm、Prisma、systemd 和 Nginx 运行 Next.js 应用。

## 1. 当前生产配置

```txt
域名：yaokai.me
备用域名：www.yaokai.me
服务器公网 IP：57.180.83.160
SSH 用户：ec2-user
默认 SSH 私钥：/Users/yaokai/Desktop/it/ios/machiL.pem
远端目录：/var/www/yaokai.me
systemd 服务名：yaokai-me.service
应用端口：3000
```

本地部署入口：

```bash
npm run deploy
```

启用或续签 HTTPS 证书时使用：

```bash
ENABLE_SSL=1 npm run deploy
```

如果私钥路径不同：

```bash
EC2_KEY=/path/to/key.pem ENABLE_SSL=1 npm run deploy
```

## 2. 部署前检查

在本地项目根目录执行：

```bash
npm run lint
npm run build
```

两条命令都通过后再部署。`npm run build` 会完成 Next.js 生产构建和 TypeScript 类型检查，是上线前最重要的本地关卡。

## 3. 一键部署流程

执行：

```bash
ENABLE_SSL=1 npm run deploy
```

脚本会自动完成以下步骤：

- 本地打包项目。
- 排除 `.env`、`.env.production`、`.next`、`node_modules`、本地数据库和备份目录。
- 上传压缩包到服务器。
- 远端备份旧版 `/var/www/yaokai.me`。
- 保留远端已有 `.env.production`、`prisma/production.db*` 和 `backups/`。
- 安装或检查 Node.js、pnpm、Nginx。
- 写入 Nginx 反向代理配置。
- 安装依赖。
- 根据 `DATABASE_URL` 自动选择 Prisma schema。
- 生成 Prisma Client。
- 执行数据库迁移。
- 按配置运行 seed。
- 构建 Next.js。
- 用 systemd 重启 `yaokai-me.service`。
- 检查 Nginx 配置并重载。
- 检查本机页面和公网入口。
- 当 `ENABLE_SSL=1` 时通过 Certbot 配置 HTTPS。

## 4. 生产环境变量

生产环境变量位于服务器：

```txt
/var/www/yaokai.me/.env.production
```

关键变量：

```txt
DATABASE_URL="file:./production.db"
NEXT_PUBLIC_SITE_URL="https://yaokai.me"
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="replace-with-admin-account"
ADMIN_PASSWORD="replace-with-strong-password"
NODE_ENV="production"
PORT=3000
```

注意：

- 本地部署脚本不会上传本地 `.env` 或 `.env.production`。
- 如果远端已有 `.env.production`，部署时会保留它。
- 首次部署如果远端没有 `.env.production`，脚本会创建基础配置；上线后请尽快修改后台账号和密码。
- `JWT_SECRET` 必须使用足够长的随机字符串。

## 5. 数据库说明

默认生产数据库为 SQLite：

```txt
DATABASE_URL="file:./production.db"
```

对应文件会被保存在：

```txt
/var/www/yaokai.me/prisma/production.db
```

如果以后切换 PostgreSQL，将 `DATABASE_URL` 改为：

```txt
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

部署脚本会自动选择：

```txt
SQLite：prisma/schema.prisma
PostgreSQL：prisma/postgresql/schema.prisma
```

查看当前会使用哪个 Prisma schema：

```bash
./scripts/prepare-prisma-provider.sh .env.production --print
```

## 6. 服务器维护命令

登录服务器：

```bash
ssh -i /Users/yaokai/Desktop/it/ios/machiL.pem ec2-user@57.180.83.160
```

查看应用服务状态：

```bash
sudo systemctl status yaokai-me --no-pager
sudo journalctl -u yaokai-me -n 100 --no-pager
```

重启应用：

```bash
sudo systemctl restart yaokai-me
```

检查 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx
```

检查端口：

```bash
curl -I http://127.0.0.1:3000/
curl -I https://yaokai.me/
```

## 7. 部署后验证

部署完成后检查：

```bash
BASE_URL=https://yaokai.me HTTP_BASE_URL=http://yaokai.me CHECK_WWW=1 npm run smoke:prod
```

也可以手动打开：

```txt
https://yaokai.me/
https://yaokai.me/explore
https://yaokai.me/guide
https://yaokai.me/projects
https://yaokai.me/robots.txt
https://yaokai.me/sitemap.xml
```

后台入口：

```txt
https://yaokai.me/yaokai
```

公开页面不会展示后台入口。访问 `/yaokai` 后会设置后台入口 Cookie，并跳转到后台登录流程。

## 8. 备份

SQLite 备份：

```bash
cd /var/www/yaokai.me
./scripts/backup-db.sh .env.production
```

备份文件会写入：

```txt
/var/www/yaokai.me/backups/
```

部署脚本会保留 `backups/`，不会覆盖已有备份。

## 9. 回滚

每次一键部署前，脚本会在服务器保留旧版目录：

```txt
/var/www/yaokai.me.backup-YYYYMMDD-HHMMSS
```

只保留最近几份备份。需要回滚时：

```bash
sudo systemctl stop nginx
sudo systemctl stop yaokai-me
sudo rm -rf /var/www/yaokai.me
sudo cp -a /var/www/yaokai.me.backup-YYYYMMDD-HHMMSS /var/www/yaokai.me
sudo chown -R ec2-user:ec2-user /var/www/yaokai.me
cd /var/www/yaokai.me
sudo systemctl start yaokai-me
sudo nginx -t
sudo systemctl start nginx
```

如果只是应用进程异常，通常不需要完整回滚，先执行：

```bash
sudo systemctl restart yaokai-me
```

## 10. 常见故障

### SSH 失败

确认私钥存在且权限正确：

```bash
chmod 400 /Users/yaokai/Desktop/it/ios/machiL.pem
ssh -i /Users/yaokai/Desktop/it/ios/machiL.pem ec2-user@57.180.83.160
```

### 网站 502

先看应用是否运行：

```bash
sudo systemctl status yaokai-me --no-pager
sudo journalctl -u yaokai-me -n 100 --no-pager
curl -I http://127.0.0.1:3000/
```

再检查 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### HTTPS 异常

重新执行：

```bash
ENABLE_SSL=1 npm run deploy
```

或在服务器上检查证书：

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### 数据库迁移失败

检查生产环境变量：

```bash
cd /var/www/yaokai.me
cat .env.production
./scripts/prepare-prisma-provider.sh .env.production --print
```

确认 `DATABASE_URL` 与实际数据库类型一致后，再执行：

```bash
pnpm prisma migrate deploy --schema "$(./scripts/prepare-prisma-provider.sh .env.production --print)"
```

### 后台无法登录

确认 `.env.production` 中的后台账号密码正确，然后运行：

```bash
cd /var/www/yaokai.me
pnpm prisma db seed --schema "$(./scripts/prepare-prisma-provider.sh .env.production --print)"
sudo systemctl restart yaokai-me
```

## 11. 推荐发布节奏

1. 本地完成修改。
2. 运行 `npm run lint`。
3. 运行 `npm run build`。
4. 运行 `ENABLE_SSL=1 npm run deploy`。
5. 运行 `BASE_URL=https://yaokai.me HTTP_BASE_URL=http://yaokai.me CHECK_WWW=1 npm run smoke:prod`。
6. 打开首页、作品页、指南页和后台入口做人工检查。
