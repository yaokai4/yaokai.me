#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const requiredFiles = [
  "app/vps/page.tsx",
  "app/vps/status/page.tsx",
  "app/vps/docs/page.tsx",
  "app/vps/security/page.tsx",
  "app/vps/changelog/page.tsx",
  "app/vps/access/page.tsx",
  "app/vps/access/docs/page.tsx",
  "app/vps/status.json/route.ts",
  "app/admin/vps/page.tsx",
  "app/admin/vps/[section]/page.tsx",
  "app/admin/vps/[section]/new/page.tsx",
  "app/admin/vps/[section]/[id]/page.tsx",
  "app/api/admin/vps/[resource]/route.ts",
  "app/api/admin/vps/[resource]/[id]/route.ts",
  "app/api/admin/vps/access-profiles/[id]/download-token/route.ts",
  "app/api/admin/vps/access-profiles/[id]/shadowrocket-token/route.ts",
  "app/api/admin/vps/access-profiles/download/[token]/route.ts",
  "app/api/vps/access/my-profile/shadowrocket-token/route.ts",
  "app/api/vps/access/shadowrocket/[token]/route.ts",
  "app/api/cron/vps-health-check/route.ts",
  "components/admin/AccessProfileActions.tsx",
  "lib/shadowrocket.ts",
  "lib/vps-config.ts",
  "lib/vps-data.ts",
  "lib/vps-health.ts",
  "prisma/migrations/00000000000003_vps_operations_content_fields/migration.sql"
];

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `缺少必要文件：${file}`);
}

const scannedFiles = [
  "app/vps/page.tsx",
  "app/vps/docs/page.tsx",
  "app/vps/security/page.tsx",
  "app/vps/changelog/page.tsx",
  "app/vps/access/page.tsx",
  "app/vps/access/docs/page.tsx",
  "lib/vps-config.ts",
  "components/admin/VpsResourceScreens.tsx"
];

const banned = [
  "\u673a\u573a",
  "\u7ffb\u5899",
  "\u79d1\u5b66\u4e0a\u7f51",
  "\u4ee3\u7406\u8ba2\u9605",
  "\u8282\u70b9\u8ba2\u9605",
  "\u89e3\u9501\u5730\u533a\u9650\u5236"
];
for (const file of scannedFiles) {
  const content = read(file);
  for (const term of banned) {
    assert(!content.includes(term), `${file} 不应包含敏感文案：${term}`);
  }
}

const envExample = read(".env.example");
for (const key of ["AUTH_SECRET", "CRON_SECRET", "ENCRYPTION_KEY", "VPS_PRIVATE_MODE", "ADMIN_PASSWORD_HASH", "EMAIL_SERVER"]) {
  assert(envExample.includes(`${key}=`), `.env.example 缺少 ${key}`);
}

for (const file of ["scripts/deploy.sh", "scripts/deploy-amazon-linux-2023.sh", "prisma/seed.ts"]) {
  const content = read(file);
  assert(!content.includes("kai" + "xuan"), `${file} 不应包含固定管理员密码`);
}

const shadowrocketRoute = read("app/api/vps/access/shadowrocket/[token]/route.ts");
assert(shadowrocketRoute.includes("createShadowrocketTokenHash"), "Shadowrocket 导入令牌必须使用独立哈希命名空间");
assert(shadowrocketRoute.includes("usedAt: null"), "Shadowrocket 导入令牌必须原子地限制为仅使用一次");
assert(!shadowrocketRoute.includes("requireVpsUser"), "Shadowrocket 客户端无法携带网页登录 Cookie，导入 GET 只能使用一次性令牌鉴权");
for (const file of ["scripts/deploy.sh", "scripts/setup-server.sh"]) {
  const content = read(file);
  assert(content.includes("access_log off"), `${file} 必须避免记录一次性令牌 URL`);
  assert(content.includes("vps/access/(download|shadowrocket)"), `${file} 必须覆盖个人配置的两种一次性令牌入口`);
  assert(content.includes("admin/vps/access-profiles/download"), `${file} 必须覆盖旧管理下载令牌入口`);
}

const adminWriteRoutes = [
  "app/api/auth/change-password/route.ts",
  "app/api/auth/logout/route.ts",
  "app/api/blog/route.ts",
  "app/api/blog/[id]/route.ts",
  "app/api/guides/route.ts",
  "app/api/guides/[id]/route.ts",
  "app/api/projects/route.ts",
  "app/api/projects/[id]/route.ts",
  "app/api/resources/route.ts",
  "app/api/resources/[id]/route.ts",
  "app/api/now/route.ts",
  "app/api/now/[id]/route.ts",
  "app/api/manifesto/route.ts",
  "app/api/manifesto/[id]/route.ts",
  "app/api/playbooks/route.ts",
  "app/api/playbooks/[id]/route.ts",
  "app/api/posts/route.ts",
  "app/api/posts/[id]/route.ts",
  "app/api/settings/route.ts",
  "app/api/messages/[id]/route.ts"
];
for (const file of adminWriteRoutes) {
  assert(read(file).includes("assertSameOrigin"), `${file} 的后台写操作必须校验同源请求`);
}

const schema = read("prisma/schema.prisma");
for (const model of ["VpsNode", "VpsService", "VpsUser", "VpsAccessPolicy", "VpsAccessProfile", "VpsAccessProfileDownload", "VpsAuditLog", "VpsAlert", "VpsBackup", "VpsCost", "VpsHealthCheck"]) {
  assert(schema.includes(`model ${model}`), `Prisma schema 缺少 ${model}`);
}

console.log("static checks passed");
