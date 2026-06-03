#!/usr/bin/env node

const baseUrl = trimSlash(process.env.BASE_URL || "https://yaokai.me");
const httpBaseUrl = trimSlash(process.env.HTTP_BASE_URL || baseUrl.replace(/^https:/, "http:"));
const repeat = Math.max(1, Number.parseInt(process.env.REPEAT || "1", 10));
const checkWww = process.env.CHECK_WWW === "1";

const noPublicAdminPatterns = [/href=["']\/admin/i, /href=["']\/yaokai/i, /\/admin\/login/i];

function trimSlash(value) {
  return value.replace(/\/+$/, "");
}

function makeUrl(path, base = baseUrl) {
  return new URL(path, `${base}/`).toString();
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function locationHeader(response) {
  return response.headers.get("location") || "";
}

async function fetchText(path, options = {}) {
  const response = await fetch(makeUrl(path, options.base), {
    redirect: options.redirect || "follow",
    headers: options.headers
  });
  const body = await response.text();
  return { response, body };
}

async function expectStatus(path, status, options = {}) {
  const { response, body } = await fetchText(path, options);
  assert(response.status === status, `${path} 应返回 ${status}，实际为 ${response.status}`);
  return { response, body };
}

async function expectBody(path, patterns) {
  const { body } = await expectStatus(path, 200);
  for (const pattern of patterns) {
    const ok = pattern instanceof RegExp ? pattern.test(body) : body.includes(pattern);
    assert(ok, `${path} 缺少内容：${String(pattern)}`);
  }
  return body;
}

async function checkHome() {
  const body = await expectBody("/", [
    "<html lang=\"zh-CN\"",
    "姚凯",
    "首页",
    "Creative Engineering",
    "合作联系",
    "把复杂想法",
    "进入内容系统",
    "Content Architecture",
    "Capability System",
    "Selected Work",
    "AI Workflow",
    "Playbook",
    "Machi iOS",
    "Machi Web"
  ]);
  for (const pattern of noPublicAdminPatterns) {
    assert(!pattern.test(body), `首页不应暴露后台入口：${pattern}`);
  }
}

async function checkLocales() {
  const en = await fetchText("/", { headers: { cookie: "yaokai_locale=en" } });
  assert(en.body.includes("<html lang=\"en\""), "英文版本应设置 html lang=en");
  assert(en.body.includes("Turning complex ideas into polished digital products."), "英文首页缺少英文主标题");
  assert(en.body.includes("Work together"), "英文导航缺少 CTA");

  const ja = await fetchText("/", { headers: { cookie: "yaokai_locale=ja" } });
  assert(ja.body.includes("<html lang=\"ja\""), "日文版本应设置 html lang=ja");
  assert(ja.body.includes("複雑なアイデアを、美しく使えるデジタルプロダクトへ。"), "日文首页缺少日文主标题");
  assert(ja.body.includes("相談する"), "日文导航缺少 CTA");
}

async function checkPublicContent() {
  await expectBody("/explore", ["Machi 双端产品路线", "资源库", "方法论"]);
  await expectBody("/library", ["资源库", "SwiftUI", "SQLite"]);
  await expectBody("/resources", ["资源库", "SwiftUI", "SQLite"]);
  await expectBody("/playbook", ["方法论", "Machi"]);
  const playbooksAlias = await fetch(makeUrl("/playbooks"), { redirect: "manual" });
  assert([301, 302, 307, 308].includes(playbooksAlias.status), `/playbooks 应跳转到 /playbook，实际为 ${playbooksAlias.status}`);
  assert(locationHeader(playbooksAlias).includes("/playbook"), `/playbooks 跳转地址应包含 /playbook，实际为 ${locationHeader(playbooksAlias)}`);
  await expectBody("/stack", ["技术栈", "技能地图", "SwiftUI"]);
  await expectBody("/now", ["当前状态"]);
  await expectBody("/manifesto", ["宣言"]);
  await expectBody("/projects/machi-ios-native-city-life-app", ["Machi iOS 原生城市生活客户端", "SwiftData", "离线优先", "RemoteSyncService"]);
  await expectBody("/projects/machi-web-unified-python-backend", ["Machi Web 与统一 Python 后端", "Next.js", "Python", "SQLite", "REST API", "SSE"]);
  await expectBody("/guide/machi-ios-offline-first-guide", ["Machi iOS 离线优先工程指南", "SwiftUI", "SwiftData", "Repository", "Keychain"]);
  await expectBody("/guide/machi-web-backend-sync-guide", ["Machi Web 与统一后端同步指南", "Next.js", "Python", "SQLite", "SSE"]);
}

async function checkAdminGate() {
  const admin = await fetch(makeUrl("/admin"), { redirect: "manual" });
  assert([301, 302, 307, 308].includes(admin.status), `/admin 应重定向，实际为 ${admin.status}`);
  assert(locationHeader(admin) === "/", `/admin 应重定向到 /，实际为 ${locationHeader(admin)}`);

  const entry = await fetch(makeUrl("/yaokai"), { redirect: "manual" });
  assert([301, 302, 307, 308].includes(entry.status), `/yaokai 应重定向，实际为 ${entry.status}`);
  assert(locationHeader(entry).includes("/admin/login"), `/yaokai 应跳到后台登录，实际为 ${locationHeader(entry)}`);

  const setCookie = entry.headers.get("set-cookie") || "";
  assert(setCookie.includes("personal_website_admin_entry=1"), "/yaokai 应设置后台入口 cookie");
  const cookie = setCookie.split(";")[0];
  const login = await fetch(locationHeader(entry), { redirect: "manual", headers: { cookie } });
  assert(login.status === 200, `带入口 cookie 访问后台登录页应为 200，实际为 ${login.status}`);
}

async function checkAdminLoginApi() {
  const response = await fetch(makeUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: "yaokai", password: "kaixuan2390166" })
  });
  const body = await response.text();
  assert(response.status === 200, `后台登录接口应返回 200，实际为 ${response.status}: ${body}`);
  assert(body.includes("\"success\":true"), "后台登录接口应成功");
  assert((response.headers.get("set-cookie") || "").includes("personal_website_session"), "后台登录接口应设置 session cookie");
}

async function checkRobotsAndSitemap() {
  await expectBody("/robots.txt", ["Disallow: /admin", "Disallow: /api", "Disallow: /yaokai"]);
  await expectBody("/sitemap.xml", ["/explore", "/guide", "/stack", "/library", "/playbook", "/projects/machi-ios-native-city-life-app", "/guide/machi-web-backend-sync-guide"]);
}

async function checkSearchApi() {
  const { response, body } = await expectStatus("/api/search", 200);
  assert(response.headers.get("content-type")?.includes("application/json"), "/api/search 应返回 JSON");
  for (const pattern of ["Machi iOS", "Machi Web", "SwiftUI", "方法论"]) {
    assert(body.includes(pattern), `/api/search 缺少搜索内容：${pattern}`);
  }
}

async function checkHttpRedirect() {
  if (!baseUrl.startsWith("https://")) return;
  if (!httpBaseUrl.startsWith("http://")) return;
  const response = await fetch(makeUrl("/", httpBaseUrl), { redirect: "manual" });
  assert([301, 302, 307, 308].includes(response.status), `HTTP 应跳转 HTTPS，实际为 ${response.status}`);
  assert(locationHeader(response).startsWith(baseUrl), `HTTP 跳转地址应指向 ${baseUrl}，实际为 ${locationHeader(response)}`);
}

async function checkWwwHost() {
  if (!checkWww) return;
  const wwwUrl = baseUrl.replace("https://", "https://www.");
  await expectStatus("/", 200, { base: wwwUrl });
}

async function runRound(index) {
  console.log(`第 ${index + 1}/${repeat} 轮 smoke test：${baseUrl}`);
  await checkHome();
  await checkLocales();
  await checkPublicContent();
  await checkAdminGate();
  await checkAdminLoginApi();
  await checkRobotsAndSitemap();
  await checkSearchApi();
  await checkHttpRedirect();
  await checkWwwHost();
  console.log(`第 ${index + 1}/${repeat} 轮通过`);
}

for (let index = 0; index < repeat; index += 1) {
  await runRound(index);
}

console.log("全部 smoke test 通过");
