#!/usr/bin/env node

const baseUrl = trimSlash(process.env.BASE_URL || "https://yaokai.me");
const httpBaseUrl = trimSlash(process.env.HTTP_BASE_URL || baseUrl.replace(/^https:/, "http:"));
const repeat = Math.max(1, Number.parseInt(process.env.REPEAT || "1", 10));
const checkWww = process.env.CHECK_WWW === "1";
const expectVpsPrivate = process.env.EXPECT_VPS_PRIVATE !== "0";
const adminAccount = process.env.ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.ADMIN_PASSWORD || "";

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

function expectNoBody(body, path, patterns) {
  for (const pattern of patterns) {
    const found = pattern instanceof RegExp ? pattern.test(body) : body.includes(pattern);
    assert(!found, `${path} 不应包含内容：${String(pattern)}`);
  }
}

async function checkHome() {
  const body = await expectBody("/", [
    "<html lang=\"zh-CN\"",
    "姚凯",
    "Yao Kai",
    "首页",
    "个人开发 / 日本生活",
    "在日本把想法写成产品，也把日常写成记录。",
    "看作品",
    "看简历",
    "可验证信号",
    "把产品交到真实世界里",
    "三端产品",
    "商用闭环",
    "持续运维",
    "联系我",
    "作品",
    "能力范围",
    "文章",
    "运行在东京的一台小小的 AWS 服务器上。"
  ]);
  const templateEmail = ["hello", "example", "com"].join("@").replace("@com", ".com");
  assert(!body.includes(templateEmail), "首页不应包含模板占位邮箱");
  assert(!body.includes("https://github.com/\""), "首页不应包含 GitHub 平台首页占位链接");
  for (const pattern of noPublicAdminPatterns) {
    assert(!pattern.test(body), `首页不应暴露后台入口：${pattern}`);
  }
}

async function checkLocales() {
  const en = await fetchText("/en");
  assert(en.body.includes("<html lang=\"en\""), "英文版本应设置 html lang=en");
  assert(en.body.includes("Yao Kai"), "英文首页缺少英文主标题");
  assert(en.body.includes("I turn small, stubborn ideas into shipped products."), "英文首页缺少英文副标题");
  assert(en.body.includes("See the work"), "英文首页缺少作品 CTA");
  assert(en.body.includes("Verifiable signals"), "英文首页缺少可验证信号区");

  const ja = await fetchText("/ja");
  assert(ja.body.includes("<html lang=\"ja\""), "日文版本应设置 html lang=ja");
  assert(ja.body.includes("姚凱"), "日文首页缺少日文汉字姓名");
  assert(ja.body.includes("よう がい"), "日文首页缺少假名姓名");
  assert(ja.body.includes("日本で暮らしながら、アイデアをプロダクトにしている開発者です。"), "日文首页缺少日文副标题");
  assert(ja.body.includes("制作実績を見る"), "日文首页缺少作品 CTA");
  assert(ja.body.includes("検証できる実績"), "日文首页缺少可验证实绩区");

  const localizedProject = await expectStatus("/en/projects/machi-web-unified-python-backend", 200);
  assert(localizedProject.body.includes("Machi Web"), "英文前缀项目详情应正常打开");

  const enProjects = await expectBody("/en/projects", ["Work", "Search projects, stack, role, or category", "Featured Case", "View full case"]);
  expectNoBody(enProjects, "/en/projects", ["搜索项目、技术栈或分类", "没有找到项目", "查看案例拆解"]);
  const enBlog = await expectBody("/en/blog", ["Writing", "Search articles, tags, or category", "Notes from behind the code.", "Continue reading"]);
  expectNoBody(enBlog, "/en/blog", ["文章 - 姚凯", "搜索文章、标签或分类", "没有找到文章", "继续阅读"]);
  const enGuide = await expectBody("/en/guide", ["Guides", "Search guides, stack, or audience", "Featured Guide", "Open method guide"]);
  expectNoBody(enGuide, "/en/guide", ["指南 - 姚凯", "搜索指南、技术栈或适合人群", "没有找到指南", "适合：", "进入指南"]);
  const enResources = await expectBody("/en/resources", ["Resources", "Search resources, technology, or use case", "Use case:", "View resource"]);
  expectNoBody(enResources, "/en/resources", ["搜索资源、技术或使用场景", "没有找到资源", "使用场景：", "打开资源"]);
  const enPosts = await expectBody("/en/posts", ["Updates", "Short notes, close to the work."]);
  expectNoBody(enPosts, "/en/posts", ["暂无公开动态"]);

  const jaProjects = await expectBody("/ja/projects", ["制作実績", "プロジェクト、技術、カテゴリを検索", "ケース全体を見る"]);
  expectNoBody(jaProjects, "/ja/projects", ["作品集", "搜索项目、技术栈或分类", "查看案例拆解"]);
  const jaBlog = await expectBody("/ja/blog", ["記事", "記事、タグ、カテゴリを検索", "コードの裏側にある考え", "続きを読む"]);
  expectNoBody(jaBlog, "/ja/blog", ["搜索文章、标签或分类", "继续阅读"]);
  const jaGuide = await expectBody("/ja/guide", ["ガイド", "ガイド、技術、対象読者を検索", "ガイドを開く"]);
  expectNoBody(jaGuide, "/ja/guide", ["搜索指南、技术栈或适合人群", "进入指南"]);
  const jaResources = await expectBody("/ja/resources", ["リソース", "リソース、技術、利用シーンを検索", "リソースを開く"]);
  expectNoBody(jaResources, "/ja/resources", ["资源库", "搜索资源、技术或使用场景", "打开资源"]);
}

async function checkPublicContent() {
  await expectBody("/zh/explore", ["Machi 双端产品路线", "资源库", "工具和资料也是能力的一部分"]);
  await expectBody("/zh/library", ["资源库", "SwiftUI", "SQLite"]);
  await expectBody("/zh/resources", ["资源库", "SwiftUI", "SQLite"]);
  await expectBody("/zh/stack", ["技术栈", "技能地图", "SwiftUI"]);
  await expectBody("/zh/contact", ["找我聊职位、合作", "可以聊什么", "职位机会", "联系姚凯"]);
  await expectBody("/zh/posts", ["动态", "短一点，离现场近一点。"]);
  if (expectVpsPrivate) {
    for (const path of ["/zh/vps", "/zh/vps/status", "/zh/vps/docs", "/zh/vps/security", "/zh/vps/access", "/zh/vps/access/docs", "/zh/vps/changelog"]) {
      const response = await fetch(makeUrl(path), { redirect: "manual" });
      assert([301, 302, 307, 308].includes(response.status), `${path} 私有模式下应重定向，实际为 ${response.status}`);
      assert(locationHeader(response).includes("/yaokai"), `${path} 私有模式下应跳到隐藏登录入口，实际为 ${locationHeader(response)}`);
    }
  } else {
    for (const path of ["/zh/vps", "/zh/vps/access"]) {
      const response = await fetch(makeUrl(path), { redirect: "manual" });
      assert([301, 302, 307, 308].includes(response.status), `${path} 未登录时应重定向，实际为 ${response.status}`);
      assert(locationHeader(response).includes("/vps/login"), `${path} 未登录时应跳到 /vps/login，实际为 ${locationHeader(response)}`);
    }
    await expectBody("/zh/vps/status", ["公开状态页", "健康信息"]);
    await expectBody("/zh/vps/docs", ["服务接入", "权限申请", "故障处理"]);
    await expectBody("/zh/vps/security", ["访问", "审计", "数据保留"]);
    await expectBody("/zh/vps/access/docs", ["Access Profile", "权限", "设备"]);
    await expectBody("/zh/vps/changelog", ["更新", "维护", "安全"]);
  }
  await expectBody("/zh/projects/machi-ios-native-city-life-app", ["Machi iOS 原生城市生活客户端", "SwiftData", "离线优先", "RemoteSyncService", "技术亮点"]);
  await expectBody("/zh/projects/machi-web-unified-python-backend", ["Machi Web 与统一 Python 后端", "Next.js", "Python", "SQLite", "REST API", "SSE"]);
  await expectBody("/zh/guide/machi-ios-offline-first-guide", ["Machi iOS 离线优先工程指南", "SwiftUI", "SwiftData", "Repository", "Keychain"]);
  await expectBody("/zh/guide/machi-web-backend-sync-guide", ["Machi Web 与统一后端同步指南", "Next.js", "Python", "SQLite", "SSE"]);
}

async function checkAdminGate() {
  const admin = await fetch(makeUrl("/admin"), { redirect: "manual" });
  assert([301, 302, 307, 308].includes(admin.status), `/admin 应重定向，实际为 ${admin.status}`);
  assert(locationHeader(admin) === "/", `/admin 应重定向到 /，实际为 ${locationHeader(admin)}`);

  const vpsAdmin = await fetch(makeUrl("/admin/vps"), { redirect: "manual" });
  assert([301, 302, 307, 308].includes(vpsAdmin.status), `/admin/vps 应重定向，实际为 ${vpsAdmin.status}`);
  assert(locationHeader(vpsAdmin).includes("/yaokai"), `/admin/vps 应跳到隐藏登录入口，实际为 ${locationHeader(vpsAdmin)}`);

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
  if (!adminPassword) {
    console.log("跳过后台登录接口检查：未设置 ADMIN_PASSWORD");
    return;
  }
  const response = await fetch(makeUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: adminAccount, password: adminPassword })
  });
  const body = await response.text();
  assert(response.status === 200, `后台登录接口应返回 200，实际为 ${response.status}: ${body}`);
  assert(body.includes("\"success\":true"), "后台登录接口应成功");
  assert((response.headers.get("set-cookie") || "").includes("personal_website_session"), "后台登录接口应设置 session cookie");
}

async function checkRobotsAndSitemap() {
  await expectBody("/robots.txt", ["Disallow: /admin", "Disallow: /api", "Disallow: /yaokai"]);
  await expectBody("/sitemap.xml", ["/zh/explore", "/ja/guide", "/en/stack", "/zh/library", "/zh/projects/machi-ios-native-city-life-app", "/en/guide/machi-web-backend-sync-guide"]);
}

async function checkSearchApi() {
  const { response, body } = await expectStatus("/api/search", 200);
  assert(response.headers.get("content-type")?.includes("application/json"), "/api/search 应返回 JSON");
  for (const pattern of ["Machi iOS", "Machi Web", "SwiftUI", "资源"]) {
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
