import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function json(value: unknown) {
  return JSON.stringify(value);
}

async function main() {
  const adminAccount = process.env.ADMIN_EMAIL || "admin@example.com";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 12);

  await prisma.user.upsert({
    where: { email: adminAccount },
    update: { passwordHash, name: "姚凯", role: "ADMIN" },
    create: {
      name: "姚凯",
      email: adminAccount,
      passwordHash,
      role: "ADMIN"
    }
  });

  const settings = {
    siteName: "姚凯",
    siteDescription: "姚凯的个人网站，展示 Web / 全栈开发作品、技术文章、项目复盘与日本 IT 求职方向的能力证据。",
    heroTitle: "姚凯 - Web / 全栈开发者",
    heroSubtitle:
      "我在日本学习和实践 Web / 全栈开发，能够从需求整理、数据库设计、前后端实现到部署上线独立推进。",
    avatarUrl: "/images/avatar-yaokai.svg",
    email: "",
    socials: json([]),
    seoTitle: "姚凯 - Web / 全栈开发者",
    seoDescription:
      "姚凯的个人网站，展示 Web / 全栈开发作品、技术文章、项目复盘、技术栈与日本 IT 求职方向的能力证据。",
    ogImage: "/images/og-cover.svg",
    theme: "light-fluid",
    icp: "",
    now: json([
      "重构明亮流体风格的个人网站。",
      "把 AI 工作流、全栈开发和产品思维整理成可复用指南。",
      "持续写作，沉淀工程执行、设计审美和长期主义方法论。"
    ])
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  const articles = [
    {
      title: "我如何理解 AI 原生产品工作流",
      slug: "ai-native-product-workflows",
      excerpt:
        "一个把 AI 从新鲜功能变成日常产品执行层的实践框架。",
      category: "AI 工作流",
      tags: ["AI", "产品", "自动化"],
      featured: true,
      pinned: true,
      content: `# 我如何理解 AI 原生产品工作流

AI 真正有用的时刻，不是被当作一个炫技入口，而是被设计进稳定的工作流里。

## 核心原则

- 方向和判断仍然由人负责。
- 让机器加速探索、起草和验证。
- 从第一天开始就把反馈闭环设计进流程。

## 示例

\`\`\`ts
type WorkflowStep = {
  intent: string;
  input: string;
  verification: string;
};
\`\`\`

目标不是替代审美和判断，而是让审美和判断拥有更大的发挥空间。`
    },
    {
      title: "如何设计高压场景下依然冷静的界面",
      slug: "calm-interfaces-under-pressure",
      excerpt:
        "运营型界面需要信息密度、清晰层级和克制表达，我会这样平衡这些约束。",
      category: "设计",
      tags: ["UI", "UX", "系统"],
      featured: true,
      pinned: false,
      content: `# 如何设计高压场景下依然冷静的界面

最好的产品界面，不需要大声提醒，也能让下一步行动变得清楚。

## 我的检查清单

1. 五秒内能否看清信息层级？
2. 高频操作能否用最少移动完成？
3. 空状态、加载状态和错误状态是否告诉用户下一步该做什么？

好的体验常常很安静，因为复杂性已经被产品内部消化掉了。`
    },
    {
      title: "构建全栈 CMS 的执行笔记",
      slug: "execution-notes-full-stack-cms",
      excerpt:
        "当一个内容系统既要前台好看，又要后台好用，真正重要的是什么。",
      category: "工程",
      tags: ["Next.js", "Prisma", "CMS"],
      featured: false,
      pinned: false,
      content: `# 构建全栈 CMS 的执行笔记

一个真正可用的 CMS 有两种性格：前台要有表达力，后台要足够稳定、清晰、可预期。

## 工程选择

- 在接口边界附近完成输入校验。
- 保持数据模型稳定。
- 让编辑操作可恢复，至少要有明确确认。

这就是演示作品和长期系统之间的差别。`
    },
    {
      title: "流体渐变个人网站的设计原则",
      slug: "fluid-gradient-personal-site-principles",
      excerpt: "明亮、梦幻和专业并不冲突，关键是让颜色、动效和内容层级互相服务。",
      category: "设计",
      tags: ["流体渐变", "个人品牌", "视觉系统"],
      featured: true,
      pinned: false,
      content: `# 流体渐变个人网站的设计原则

明亮风格最容易犯的错误，是把颜色当作装饰。真正高级的流体渐变，需要承担信息分区、品牌记忆和情绪引导。

## 我的原则

1. 背景负责氛围，不抢正文。
2. 卡片要像玻璃承载内容，而不是透明贴片。
3. 动效应该像呼吸，少而持续。

好的个人网站不是简历换皮，而是一个可探索的内容产品。`
    },
    {
      title: "从想法到产品原型的 AI 协作流程",
      slug: "ai-to-product-prototype-workflow",
      excerpt: "我如何把研究、拆解、原型、代码和复盘串成一个稳定的 AI 协作流程。",
      category: "AI 工作流",
      tags: ["AI", "原型", "产品"],
      featured: false,
      pinned: false,
      content: `# 从想法到产品原型的 AI 协作流程

AI 最适合帮助我们快速展开可能性，但它不能替代产品判断。

## 工作流

- 先写清楚目标用户和使用场景。
- 让 AI 帮助列出风险、边界和替代方案。
- 用低成本原型验证最关键的交互。
- 最后再进入工程实现。

我关心的不是一次生成多少内容，而是每一步是否能提高判断质量。`
    },
    {
      title: "我如何建立长期内容系统",
      slug: "long-term-content-system",
      excerpt: "内容系统的价值不在于更新频率，而在于它能否持续积累判断、经验和作品证据。",
      category: "内容系统",
      tags: ["写作", "数字花园", "长期主义"],
      featured: false,
      pinned: false,
      content: `# 我如何建立长期内容系统

长期内容系统应该同时服务三件事：记录事实、沉淀方法、展示能力。

## 内容不是库存

如果一篇文章不能帮助我复盘判断，或者帮助访问者理解我的工作方式，它就不应该只是为了填充页面而存在。

## 内容地图

指南、文章、项目、方法论和资源库之间应该互相连接，让访问者可以沿着自己的兴趣探索。`
    },
    {
      title: "Machi iOS 的离线优先架构拆解",
      slug: "machi-ios-offline-first-architecture",
      excerpt:
        "从 SwiftUI、SwiftData、Repository、Service 到 Keychain 和远端同步，拆解 Machi iOS 的核心工程结构。",
      category: "iOS 工程",
      tags: ["SwiftUI", "SwiftData", "离线优先", "Machi"],
      featured: true,
      pinned: false,
      content: `# Machi iOS 的离线优先架构拆解

Machi iOS 是一个城市本地生活与同城社交客户端，功能覆盖信息流、发布、评论、点赞、收藏、关注、私信、通知、城市频道和话题。

## 技术结构

- SwiftUI 负责声明式界面和 NavigationStack 路由。
- SwiftData 负责本地持久化、版本化 Schema 和迁移恢复。
- Repository 层封装本地数据读写。
- Service 层处理认证、网络、同步、媒体缓存和地区目录。
- Keychain 保存登录 Token，避免凭据落入明文存储。

## 离线优先

App 可以离线浏览和起草内容，联网并登录后再由 RemoteSyncService 与统一后端对齐。这个设计让 iOS 不是一个单纯 Web API 壳，而是拥有本地韧性的原生客户端。

## 关键判断

我选择无第三方依赖，是为了让系统边界更清楚。SwiftUI、SwiftData、Foundation、Security 和 Network 已经足够支撑一个可运行、可维护的第一版。`
    },
    {
      title: "Machi Web 与统一后端的双端同步设计",
      slug: "machi-web-ios-shared-backend-sync",
      excerpt:
        "Machi Web 使用 Next.js 客户端与 Python + SQLite 后端，和 iOS 共享账号、Feed、互动、私信、通知与会员状态。",
      category: "全栈工程",
      tags: ["Next.js", "Python", "SQLite", "SSE", "双端同步"],
      featured: true,
      pinned: false,
      content: `# Machi Web 与统一后端的双端同步设计

Machi Web 不是孤立官网，而是和 iOS App 共享同一套账号、数据库、API 和内容状态的 Web 客户端。

## 技术栈

- 后端：Python 单文件服务 \`server.py\`
- 数据库：SQLite，WAL、索引、soft delete 和 cursor 分页
- Web 客户端：Next.js 15、React 19、TypeScript、Tailwind、Zustand、TanStack Query
- 实时能力：Server-Sent Events，用于通知与私信更新

## API 覆盖

统一后端覆盖注册登录、Feed、帖子 CRUD、点赞、收藏、转发、评论、搜索、话题、通知、私信、媒体上传、设置、设备、草稿、反馈、会员与支付等 80+ REST 端点。

## 同步原则

后端是唯一真相源。Web 和 iOS 可以拥有不同布局和交互，但用户、帖子、资讯、会员、支付状态、互动数据、城市语言筛选和核心 API 必须保持同步。`
    },
    {
      title: "我为什么要重做自己的个人网站",
      slug: "why-i-redesigned-my-personal-website",
      excerpt:
        "个人网站不应该只在发布当天好看，它应该持续展示我正在做什么、怎么判断问题、以及哪些项目真的被打磨过。",
      category: "个人品牌",
      tags: ["个人网站", "内容系统", "长期主义"],
      featured: true,
      pinned: false,
      content: `# 我为什么要重做自己的个人网站

我重做 yaokai.me，不是因为旧网站不能用，而是因为它还没有承担我真正想让它承担的角色。

## 旧问题

普通个人主页很容易变成三个模块：一句定位、一组作品、一个联系方式。它能说明我做过什么，但很难说明我怎么判断、怎么实现、怎么复盘，也很难把正在推进的事情持续放出来。

## 新目标

我希望这个网站像一个长期运行的个人数字产品。首页负责建立第一印象，Explore 负责给访客路线，Projects 负责展示真实案例，Guide 负责沉淀方法，Blog 负责写下判断，Now 负责记录正在发生的事。

## 为什么选择明亮流体风格

我不想再走单纯暗色科技风。明亮、通透、流体的视觉更接近我现在想表达的状态：技术要清楚，设计要有呼吸感，内容要能长期阅读。

## 复盘

个人网站不是简历的外壳，而是一个公开的工作系统。它应该持续证明一个人如何思考、如何做项目、如何把想法维护成作品。`
    },
    {
      title: "AI 写代码很快，但真正难的是判断",
      slug: "ai-codes-fast-judgement-is-hard",
      excerpt:
        "AI 能加速实现，但它不会自动知道项目边界、质量标准、上线风险和长期维护成本，这些仍然需要人负责。",
      category: "AI 工作流",
      tags: ["AI", "Codex", "工程判断"],
      featured: true,
      pinned: false,
      content: `# AI 写代码很快，但真正难的是判断

AI 让写代码这件事变快了，但项目并没有因此自动变简单。真正难的部分，反而更明显：判断什么应该做，什么不能动，什么需要验证。

## 速度不是质量

一个模型可以很快生成组件、接口和样式，但它不知道这个项目背后的历史，也不知道哪些文件属于后台边界、哪些脚本负责生产部署、哪些改动会影响已有数据。

## 我会先给 AI 明确边界

例如在 yaokai.me 的重构里，前台页面、组件、视觉和文案可以大改；后台、数据库、API、文章系统和部署脚本不能被破坏。没有这个边界，生成速度越快，风险越大。

## 判断来自运行结果

我不会把 AI 的回答当成结论。代码要能构建，页面要能打开，移动端要能读，Dropdown 不能穿透背景，hover 不能出现黑点，部署脚本要能保留生产数据。

## 更好的协作方式

AI 适合做探索、候选方案、实现细节和检查清单。人要负责目标、取舍、验收和复盘。这样 AI 才是放大判断，而不是制造更多不确定性。`
    },
    {
      title: "Machi 项目给我的产品启发",
      slug: "machi-product-lessons",
      excerpt:
        "Machi 让我重新理解本地生活产品：双端同步、离线优先、城市与语言维度，背后都是产品判断而不只是技术实现。",
      category: "产品思考",
      tags: ["Machi", "产品", "双端同步"],
      featured: false,
      pinned: false,
      content: `# Machi 项目给我的产品启发

Machi 表面上是城市本地生活与同城社交产品，实际训练的是复杂产品系统能力：信息流、发布、评论、互动、私信、通知、城市频道、会员和双端同步都要一起考虑。

## 本地生活不是一个 Feed 就够了

城市生活内容天然带有地点、语言、时间和信任关系。租房、二手、招聘、活动、问答和避坑经验需要不同的信息密度，也需要不同的风险控制。

## iOS 和 Web 不必长得一样

iOS 需要原生节奏、离线浏览和本地草稿，Web 需要更强的信息密度和桌面浏览效率。但它们必须共享账号、帖子、互动、私信、通知和会员状态。

## 离线优先是一种产品承诺

弱网环境下仍能浏览、起草和恢复状态，会让用户感觉产品更可靠。这不是简单缓存，而是数据模型、同步服务和失败恢复一起工作的结果。

## 最大启发

产品判断和工程架构不是两件事。你选择什么数据模型、什么同步策略、什么客户端边界，最后都会变成用户体验的一部分。`
    },
    {
      title: "一个个人品牌网站应该展示什么",
      slug: "what-a-personal-brand-site-should-show",
      excerpt:
        "我认为个人品牌网站应该展示作品、判断、方法、工具、当前状态和长期原则，而不是只展示几个漂亮卡片。",
      category: "个人品牌",
      tags: ["个人品牌", "作品集", "内容策略"],
      featured: false,
      pinned: false,
      content: `# 一个个人品牌网站应该展示什么

一个好的个人品牌网站，不应该只是“我是谁”的包装，而应该回答“我如何做事，以及为什么值得信任”。

## 作品证明执行力

项目页面不能只放截图和技术栈。它应该写清背景、问题、我的角色、核心挑战、技术架构、产品判断、最终结果和复盘。

## 文章证明判断

文章不是为了凑更新。它应该记录构建中的真实判断，比如为什么重做网站、为什么选择某种架构、为什么某个功能暂时不做。

## 指南证明可复用能力

Guide 的价值是把经验拆成下一次能用的步骤。它应该具体到场景、边界、风险和检查清单。

## Now 证明网站是活的

访客应该知道我正在构建什么、研究什么、整理什么。一个长期不更新的网站，很难建立长期信任。

## 结论

个人品牌不是把自己说得更厉害，而是让真实能力以结构化证据出现。`
    },
    {
      title: "做后台系统时，我最在意的 7 个细节",
      slug: "seven-details-i-care-about-in-admin-systems",
      excerpt:
        "后台系统看起来低调，但它决定内容能否长期维护。我会特别关注字段、状态、校验、反馈、恢复、权限和部署后的可验证性。",
      category: "工程",
      tags: ["后台", "CMS", "工程质量"],
      featured: false,
      pinned: false,
      content: `# 做后台系统时，我最在意的 7 个细节

后台系统通常不会出现在宣传图里，但它决定一个产品能不能长期运行。前台负责被看见，后台负责让未来的更新不痛苦。

## 1. 字段必须说人话

编辑内容时不应该猜字段含义。标题、摘要、状态、标签、排序、是否精选，都要和真实运营动作对应。

## 2. 状态要清楚

发布、草稿、隐藏、已读、精选、置顶这些状态要一眼看见，不能藏在复杂操作里。

## 3. 校验要在边界发生

前端校验负责及时反馈，API 校验负责保护数据。只有其中一个都不够。

## 4. 危险操作要可确认

删除和覆盖类动作必须有确认。长期系统最怕误操作没有恢复路径。

## 5. 空状态要有下一步

没有数据时，不要只显示空白。用户应该知道下一步可以创建、筛选还是返回。

## 6. 后台也需要审美

后台不需要浮夸，但需要清楚的间距、层级、按钮反馈和移动端可用性。

## 7. 上线后要能验证

后台保存成功只是第一步。内容是否出现在前台、搜索是否能找到、构建是否通过，都是交付的一部分。`
    }
  ];

  const articleDepthAdditions: Record<string, string> = {
    "ai-native-product-workflows": `## 我现在更实际的理解

AI 原生不是在页面上放一个聊天框，而是把 AI 放进每个需要展开、压缩、检查和复盘的节点。比如重构个人网站时，AI 可以帮助列出验收标准、发现重复文案、生成组件候选，但最终要由运行结果和用户体验决定是否保留。

## 风险

最大的风险是把 AI 的流畅输出误认为正确。模型能把话说得完整，但它不天然理解业务边界、生产数据、部署脚本和长期维护成本。所以我会把 AI 产出当作候选，而不是结论。

## 更好的落点

我更看重一套能反复使用的流程：先定义问题，再展开可能性，然后筛掉风险，最后用构建、测试和复盘收口。`,
    "calm-interfaces-under-pressure": `## 为什么运营界面要冷静

后台、CMS、监控台和内容管理界面经常在压力下使用。用户不是来欣赏页面的，而是要快速判断状态、完成操作、避免出错。

## 视觉克制不是简陋

冷静界面仍然需要审美。间距、对齐、按钮优先级、错误提示、空状态和保存反馈，都决定用户是否信任系统。它不需要夸张的装饰，但需要稳定的节奏。

## 我的实践

前台可以更流体、更有视觉记忆；后台则应该更像工具。两者不是冲突，而是服务不同场景。`,
    "execution-notes-full-stack-cms": `## CMS 的难点

CMS 最难的不是把 Markdown 存进数据库，而是让内容模型、后台编辑、前台展示和 SEO 元数据长期保持一致。每新增一个内容类型，都要考虑列表、详情、搜索、推荐、后台管理和部署后的数据迁移。

## 我会优先保护数据边界

文章、项目、指南、资源、Now 和 Playbook 各自有不同字段。与其做一个万能内容表，我更愿意让模型语义清楚，再用 normalize 函数处理 JSON 字段和前台展示所需格式。

## 判断

一个好用的 CMS 应该让内容持续增加，而不是让维护者每次更新都担心破坏页面。`,
    "fluid-gradient-personal-site-principles": `## 明亮风格的边界

明亮流体风格很容易过度：颜色太多、透明太重、动效太抢、背景太脏。高级感的关键不是更亮，而是让光感服务信息层级。

## 我会检查这些细节

鼠标光场不能像黑点，Dropdown 不能透明穿透，卡片背景不能影响文字可读性，按钮 hover 要有反馈但不能像廉价霓虹。移动端还要减少动画密度，让阅读舒服。

## 结论

视觉系统应该让内容更可信，而不是让访客只记得背景效果。`,
    "ai-to-product-prototype-workflow": `## 原型不是跳过思考

AI 能让原型更快出现，但速度越快，越需要提前定义什么是有效。否则很容易做出一堆看起来完整、但无法验证价值的页面。

## 我常用的判断顺序

先写用户场景，再列关键动作，然后确定数据结构，最后才进入界面。AI 可以帮我生成多个信息架构方案，但我会根据维护成本、上线路径和用户理解成本做取舍。

## 复盘

真正好的原型应该能回答问题，而不是制造更多功能。`,
    "long-term-content-system": `## 长期内容系统需要结构

如果内容只是按发布时间堆叠，很快会变成旧文章列表。长期系统需要内容之间有关系：项目能关联指南，指南能关联文章，文章能把读者带到下一步。

## 我为什么加入 Now 和 Manifesto

Now 让网站有当前状态，Manifesto 让长期原则可见。它们不是装饰模块，而是帮助访客理解我正在做什么、为什么这样做。

## 判断

长期输出不是追求频率，而是让每一次输出都能进入一个可以复利的结构。`,
    "machi-ios-offline-first-architecture": `## 为什么这个架构值得记录

Machi iOS 的复杂度来自真实产品场景：城市、语言、Feed、发布、互动、私信、通知、会员和设置都在同一个客户端里。离线优先不是简单缓存，而是让用户在不稳定网络下仍能继续动作。

## 我最在意的点

SwiftData 模型要能迁移，Repository 要隔离本地读写，Service 要让认证、网络、媒体和同步各自有边界，Keychain 要保护凭据。这样 App 才不是临时 Demo，而是能继续扩展。

## 产品层面的收获

原生客户端的价值不只是性能，而是本地韧性和系统级体验。`,
    "machi-web-ios-shared-backend-sync": `## 双端同步的真实难点

Web 和 iOS 共用后端时，最怕的是接口语义慢慢分叉。今天 Web 多一个字段，明天 iOS 少一个兼容值，几次迭代后两个客户端就会开始互相拖累。

## 我会固定哪些契约

用户身份、帖子状态、互动计数、评论关系、私信会话、通知事件、会员状态和支付边界都要来自同一个真相源。平台差异应该留在界面和交互层，而不是数据事实层。

## 复盘

这个项目让我更确定：全栈能力不是会写前后端，而是能维护端到端的一致性。`
  };

  for (const article of articles) {
    const enhancedArticle = {
      ...article,
      content: `${article.content}${articleDepthAdditions[article.slug] ? `\n\n${articleDepthAdditions[article.slug]}` : ""}`
    };
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        ...enhancedArticle,
        tags: json(article.tags),
        status: "DRAFT",
        seoTitle: article.title,
        seoDescription: article.excerpt,
        publishedAt: null
      },
      create: {
        ...enhancedArticle,
        tags: json(article.tags),
        status: "DRAFT",
        seoTitle: article.title,
        seoDescription: article.excerpt,
        publishedAt: null
      }
    });
  }

  const obsoleteProjectSlugs = [
    "personal-intelligence-dashboard",
    "brand-cms-creator-portfolios",
    "automation-studio-repeated-work",
    "bright-content-universe-website"
  ];

  await prisma.project.deleteMany({
    where: { slug: { in: obsoleteProjectSlugs } }
  });

  const projects = [
    {
      title: "Machi Web 与统一 Python 后端",
      slug: "machi-web-unified-python-backend",
      subtitle: "Machi / Web + API",
      excerpt: "城市本地生活社区的 Web 客户端与统一后端，承载帖子、租房、二手、求职、私信、通知、会员和媒体上传。",
      longDescription:
        "Machi 是我独立开发的城市生活社区产品。Web 端使用 Next.js，后端使用 Python 服务和数据库承载统一 API，让 Web、iOS、Android 能共享账号、内容、互动、通知和会员状态。",
      category: "Machi / Web",
      tags: ["Machi", "Web", "Backend", "GitHub"],
      techStack: ["Next.js", "React", "TypeScript", "Python", "SQLite", "SSE", "REST API", "AWS"],
      role: "产品设计、全栈架构、Web 客户端、Python API、数据库、部署运维",
      background: "我希望把东京生活里分散的租房、二手、工作、本地服务和交流需求放到同一个城市空间里。",
      challenge: "Web、iOS、Android 必须共享同一套数据事实，同时保留各自平台的交互节奏。",
      solution: "我用统一 API 管理账号、Feed、帖子、私信、通知、媒体和会员状态，并用兼容 DTO 降低多端同步风险。",
      result: "形成了 80+ REST + SSE 接口、19 张数据表、媒体上传、soft delete、cursor 分页和多端同步的产品基础。",
      responsibilities: ["产品规划与信息架构", "Next.js Web 客户端", "Python REST + SSE API", "数据库设计与迁移", "AWS / Nginx / systemd 部署"],
      keyChallenges: ["多端 DTO 稳定性", "城市、语言、内容类型的筛选模型", "媒体上传与分发", "私信与通知实时性"],
      solutions: ["把账号、帖子、互动、通知和会员状态放在统一 API 中", "为 Web / iOS / Android 保持兼容字段", "媒体走对象存储与 CDN", "用 SSE 处理轻量实时更新"],
      features: ["城市频道", "帖子与结构化发布", "私信", "通知", "会员状态", "媒体上传"],
      architectureNotes: "Next.js Web 客户端调用统一 Python API；后端负责认证、业务数据、SSE 和媒体上传签名；部署层由 Nginx、systemd 和 AWS 资源承载。",
      technicalHighlights: ["80+ REST + SSE endpoints", "Shared DTO", "Cursor pagination", "Soft delete", "Media upload", "Multi-client sync"],
      metrics: ["5 public GitHub repositories", "3 clients", "80+ API endpoints"],
      measurableResults: ["Web Beta 已公开", "三端共享同一套 API", "具备继续迁移 PostgreSQL 与 App 上架的基础"],
      lessons: ["多端产品最重要的是数据契约稳定", "Web 和 App 可以不同，但不能相信不同事实"],
      nextSteps: ["继续准备 iOS / Android 上架", "补充更多真实界面截图", "把早期 SQLite 数据逐步迁移到 PostgreSQL"],
      status: "Web Beta",
      demoUrl: "https://machicity.com",
      githubUrl: "https://github.com/yaokai4/Machi-Web",
      coverImage: "/images/project-1.svg",
      featured: true,
      sortOrder: 1,
      content: `## 项目背景

Machi 是我独立开发的城市本地生活社区。它把租房、二手、求职、本地服务、Q&A、私信、通知和会员能力放进同一个城市空间里。

## 我的角色

我负责产品规划、Web 客户端、统一后端、数据库、API 契约、部署和运维。这个项目不是静态作品，而是我持续维护的真实产品。

## 技术结构

- Web：Next.js、React、TypeScript、Tailwind CSS。
- API：Python REST + SSE。
- 数据：SQLite 起步，按迁移到 PostgreSQL 的方向设计。
- 运维：AWS、Nginx、systemd、对象存储与 CDN。

## 复盘

Machi Web 让我更清楚地理解：全栈不是把前端和后端都写完，而是让用户、数据、权限、媒体、通知和部署在同一个产品里稳定运转。`
    },
    {
      title: "Machi iOS 原生城市生活客户端",
      slug: "machi-ios-native-city-life-app",
      subtitle: "Machi / iOS",
      excerpt: "SwiftUI + SwiftData 的离线优先 iOS 客户端，覆盖首页、发现、发布、通知、私信、我的和设置等核心模块。",
      longDescription:
        "Machi iOS 是 Machi 产品的原生客户端。我希望它不是 Web 的外壳，而是有本地持久化、离线草稿、Keychain 凭据保护和同步恢复能力的 App。",
      category: "Machi / iOS",
      tags: ["Machi", "iOS", "SwiftUI", "GitHub"],
      techStack: ["SwiftUI", "SwiftData", "Keychain", "URLSession", "MVVM", "Repository", "Offline-first"],
      role: "iOS 架构、SwiftUI 页面、本地数据层、同步服务、认证与产品功能设计",
      background: "城市生活类 App 经常会遇到弱网、草稿、图片和多页面状态恢复问题，原生端需要有自己的韧性。",
      challenge: "在离线浏览、草稿暂存、恢复同步和统一后端之间保持清晰边界。",
      solution: "用 SwiftData 管理本地数据，Repository 隔离读写，Service 负责认证、网络、同步、媒体缓存和地区目录。",
      result: "形成了可离线浏览、可恢复、可同步的原生客户端基础，能和 Web 共享账号、帖子、私信、通知和会员状态。",
      responsibilities: ["SwiftUI 页面与导航", "SwiftData Schema 与迁移", "Repository / Service 分层", "Keychain 登录状态", "远端同步与错误恢复"],
      keyChallenges: ["离线草稿", "同步冲突", "多 Tab 状态", "凭据安全"],
      solutions: ["本地优先读写", "网络恢复后同步", "Keychain 保存 Token", "服务层拆分认证、媒体、地区和通知偏好"],
      features: ["首页", "发现", "发布", "通知", "私信", "我的", "设置"],
      architectureNotes: "SwiftUI 负责界面和 NavigationStack；SwiftData 负责本地持久化；Repository 管理本地实体；Service 管理认证、网络、同步和偏好。",
      technicalHighlights: ["SwiftData migration", "Keychain auth", "Offline drafts", "Repository pattern", "Remote sync"],
      metrics: ["Native iOS client", "Shared API", "Offline-first"],
      measurableResults: ["App Store 上架准备中", "具备真实产品复杂度", "与 Machi Web 使用统一后端"],
      lessons: ["原生客户端的价值在于系统级体验和本地韧性"],
      nextSteps: ["完成上架材料", "补齐截图与隐私说明", "继续优化弱网同步"],
      status: "App 准备中",
      demoUrl: "https://machicity.com",
      githubUrl: "https://github.com/yaokai4/Machi-App-IOS",
      coverImage: "/images/project-2.svg",
      featured: true,
      sortOrder: 2,
      content: `## 项目背景

Machi iOS 是城市生活社区 Machi 的原生客户端。它服务的不是一个简单信息流，而是包含发布、互动、私信、通知、城市频道和会员状态的完整产品。

## 技术结构

- SwiftUI：界面、导航、多 Tab。
- SwiftData：本地持久化、Schema 版本和迁移。
- Repository：隔离本地数据读写。
- Service：认证、网络、同步、媒体缓存、地区目录。
- Keychain：保存登录凭据。

## 复盘

离线优先不是“缓存一下”。它要求数据模型、同步服务、失败恢复和用户体验一起设计。这个项目也让我把移动端能力补进了自己的全栈范围里。`
    },
    {
      title: "Machi Android 原生城市生活客户端",
      slug: "machi-android-native-city-life-app",
      subtitle: "Machi / Android",
      excerpt: "Kotlin / Jetpack Compose 实现的 Android 客户端，让 Machi 的城市生活产品能力覆盖 Android 用户。",
      longDescription:
        "Machi Android 是 Machi 的第三个客户端，目标是和 Web / iOS 共用同一套 API，同时用 Android 原生方式组织页面、状态和用户动作。",
      category: "Machi / Android",
      tags: ["Machi", "Android", "Kotlin", "GitHub"],
      techStack: ["Kotlin", "Jetpack Compose", "Android", "REST API", "State management", "Shared backend"],
      role: "Android 客户端实现、Compose 页面、API 对接、产品流程整理",
      background: "Machi 如果要成为真正的城市生活社区，就不能只停留在 Web 和 iOS。",
      challenge: "在 Android 端复用统一 API，同时保持原生交互和清晰状态管理。",
      solution: "用 Jetpack Compose 搭建页面与组件，用统一 API 对接账号、Feed、发布、通知和私信等核心模块。",
      result: "Machi 形成 Web / iOS / Android 三端结构，证明产品不是单页面 Demo，而是多端系统。",
      responsibilities: ["Compose UI", "API 对接", "状态组织", "多端功能对齐", "上架前准备"],
      keyChallenges: ["与 Web / iOS 的接口一致性", "Android 原生交互", "发布流程与媒体能力"],
      solutions: ["复用统一 API 契约", "按模块拆分页面状态", "保持核心流程和三端一致"],
      features: ["Feed", "发布", "城市频道", "通知", "私信", "个人中心"],
      architectureNotes: "Android 客户端使用 Kotlin 与 Jetpack Compose 构建界面，通过 Machi 统一后端获取用户、内容、互动和通知数据。",
      technicalHighlights: ["Jetpack Compose", "Shared REST API", "Multi-client contract", "Native Android"],
      metrics: ["Third Machi client", "Shared API", "Public GitHub repo"],
      measurableResults: ["Android 仓库公开", "三端产品结构完整", "Google Play 上架准备中"],
      lessons: ["三端一致性要从 API 契约开始，而不是靠每个客户端临时适配"],
      nextSteps: ["完善 Android 端截图", "补齐上架文案", "继续优化发布与媒体体验"],
      status: "App 准备中",
      demoUrl: "https://machicity.com",
      githubUrl: "https://github.com/yaokai4/Machi-App-Android",
      coverImage: "/images/project-3.svg",
      featured: true,
      sortOrder: 3,
      content: `## 项目背景

Machi Android 是 Machi 的原生 Android 客户端。它让 Machi 从 Web / iOS 扩展到三端，也让统一 API 的设计真正接受多客户端检验。

## 技术结构

- Kotlin：客户端主语言。
- Jetpack Compose：声明式 UI。
- REST API：复用 Machi 统一后端。
- 模块化页面：Feed、发布、通知、私信、个人中心。

## 复盘

Android 客户端让我重新检查了 API 契约是否足够稳定。三端项目最怕各写各的，真正需要投入的是共享模型、错误处理和功能边界。`
    },
    {
      title: "Shangence 商衡",
      slug: "shangence-business-risk-assessment",
      subtitle: "Business risk assessment",
      excerpt: "面向日本市场的事业风险诊断服务，包含 7 步诊断、规则评分、Stripe 日元支付、PDF 报告和管理后台。",
      longDescription:
        "Shangence 商衡是我独立开发的第二个产品。它服务想在日本创业或做小规模事业的人，把风险、费用、验证方法、撤退基准和法务注意点整理成可购买的详细报告。",
      category: "SaaS / 商用服务",
      tags: ["Shangence", "Stripe", "Prisma", "GitHub"],
      techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Stripe", "Zod", "PDF", "Vitest"],
      role: "产品企划、诊断逻辑、前后端、支付、PDF、后台、法务页面与部署",
      background: "很多想在日本创业的人缺少一套低成本、结构化的早期风险判断工具。",
      challenge: "诊断要足够清楚，付费链路要可信，风险评分还必须可复现，不能只靠生成式文本。",
      solution: "用 7 步表单收集关键信息，用规则引擎计算风险评分，Stripe 处理日元支付，PDF 生成详细报告，后台处理订单、退款和审计。",
      result: "形成从免费诊断、注册、付费报告、PDF 下载到后台运营的完整商用闭环。",
      responsibilities: ["商业设计", "诊断流程", "规则评分", "Stripe 支付", "PDF 报告", "后台与审计", "法务页面"],
      keyChallenges: ["评分透明性", "支付与权限", "隐私信息脱敏", "退款与审计"],
      solutions: ["评分由规则引擎计算", "Stripe 日元支付", "订单和报告权限绑定", "后台支持审核与退款"],
      features: ["7 步诊断", "风险评分", "付费报告", "PDF 下载", "管理后台", "法务页面"],
      architectureNotes: "Next.js App Router 承载前台与后台；Prisma / PostgreSQL 管理诊断、订单、权限和审计；Stripe 处理日元支付；PDF 模块生成详细报告。",
      technicalHighlights: ["Rule engine", "Stripe JPY", "PDF report", "Admin console", "PII masking", "Audit log"],
      metrics: ["Paid report flow", "7-step assessment", "Public GitHub repo"],
      measurableResults: ["服务已公开运营", "完成付费链路和后台运营能力", "具备日本市场公开所需法务页面"],
      lessons: ["商用产品要把支付、权限、退款、隐私和法务一起设计"],
      nextSteps: ["继续优化诊断问题", "补充更多行业场景", "根据真实反馈调整报告结构"],
      status: "运营中",
      demoUrl: "https://shangence.com",
      githubUrl: "https://github.com/yaokai4/Shangence",
      coverImage: "/images/project-4.svg",
      featured: true,
      sortOrder: 4,
      content: `## 项目背景

Shangence 商衡面向想在日本创业或开展小规模事业的人。它不是泛泛地给建议，而是用结构化问题把风险、费用、验证方法、撤退基准和法务注意点整理出来。

## 技术结构

- Next.js App Router：前台诊断、结果页、会员与后台。
- Prisma / PostgreSQL：诊断、订单、报告权限、审计日志。
- Stripe：日元支付。
- PDF：生成付费详细报告。
- Zod / Vitest：校验与关键逻辑测试。

## 复盘

这个项目让我完整走了一遍商用服务链路。真正难的不是表单，而是支付、权限、退款、隐私、审计和法务页面都要能一起工作。`
    },
    {
      title: "yaokai.me 个人网站与内容后台",
      slug: "yaokai-me-personal-site",
      subtitle: "Portfolio / CMS",
      excerpt: "你正在看的这个网站。Next.js 16 + Prisma 构建，中日英三语，包含文章、作品、简历、联系表单和后台 CMS。",
      longDescription:
        "yaokai.me 是我的个人网站，也是一套小型内容系统。它负责展示简历、真实项目、文章和联系入口，后台可以管理文章、项目、动态和留言。",
      category: "个人网站 / CMS",
      tags: ["Portfolio", "CMS", "Next.js", "GitHub"],
      techStack: ["Next.js 16", "React", "TypeScript", "Prisma", "Tailwind CSS", "i18n", "Nginx", "Lightsail"],
      role: "信息架构、视觉设计、全栈实现、内容后台、部署脚本与生产运维",
      background: "我需要一个不只是放简历的站点，而是能长期展示项目、文章和当前状态的个人阵地。",
      challenge: "网站要同时服务求职、作品展示、写作和联系，还要中日英语言切换稳定。",
      solution: "用 Next.js + Prisma 做前台和后台，精简导航，突出两个真实产品，并让文章页面成为后台可持续发布的入口。",
      result: "本站成为可部署、可维护、可扩展的个人内容系统，代码公开在 GitHub。",
      responsibilities: ["首页重构", "三语文案", "作品与简历整合", "后台 CMS", "部署脚本", "SEO 与 sitemap"],
      keyChallenges: ["语言切换状态", "真实作品取舍", "后台与前台边界", "生产部署安全"],
      solutions: ["基于路径和 cookie 的 locale", "保留文章后台", "隐藏不必要页面入口", "部署时保留生产数据"],
      features: ["首页", "作品", "文章", "关于 / 简历", "联系表单", "后台 CMS", "三语切换"],
      architectureNotes: "Next.js App Router 负责页面；Prisma 管理内容；proxy 根据语言前缀写入请求头；部署脚本打包上传到服务器并保留生产环境变量和数据库。",
      technicalHighlights: ["App Router", "Prisma CMS", "Locale rewrite", "Contact inbox", "SEO", "One-command deploy"],
      metrics: ["3 languages", "5 real project entries", "Admin CMS"],
      measurableResults: ["当前版本已上线部署", "公开源码", "后续可通过后台发布文章"],
      lessons: ["个人网站最该证明真实项目，而不是堆很多听起来厉害的模块"],
      nextSteps: ["持续发布开发笔记", "补充产品截图", "根据求职反馈继续调整文案"],
      status: "本站",
      demoUrl: "https://yaokai.me",
      githubUrl: "https://github.com/yaokai4/yaokai.me",
      coverImage: "/images/project-5.svg",
      featured: true,
      sortOrder: 5,
      content: `## 项目背景

yaokai.me 是我的个人网站，也是我自己使用的内容后台。它要承担简历、作品、文章、联系入口和长期更新的职责。

## 技术结构

- Next.js 16 / React / TypeScript。
- Prisma 管理文章、项目、动态和留言。
- Tailwind CSS 建立简历同源的视觉风格。
- proxy + cookie + path prefix 支持中日英三语。
- 部署脚本负责打包、上传、迁移、构建、重启和生产检查。

## 复盘

这次重做的核心不是加更多页面，而是删掉噪音，把真实作品和当前身份说清楚：我是 Machi 和 Shangence 的开发者，也能把一个 Web 产品从想法推进到上线。`
    }
  ];

  for (const project of projects) {
    const enhancedProject = {
      ...project,
      longDescription: project.longDescription || project.excerpt,
      tags: json(project.tags),
      gallery: json([]),
      screenshots: json([]),
      responsibilities: json(project.responsibilities),
      keyChallenges: json(project.keyChallenges),
      solutions: json(project.solutions),
      features: json(project.features),
      technicalHighlights: json(project.technicalHighlights),
      metrics: json(project.metrics),
      measurableResults: json(project.measurableResults),
      lessons: json(project.lessons),
      nextSteps: json(project.nextSteps),
      startDate: "",
      endDate: "",
      publishedAt: new Date(),
      seoTitle: project.title,
      seoDescription: project.excerpt,
      ogImage: project.coverImage
    };
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        ...enhancedProject,
        techStack: json(project.techStack)
      },
      create: {
        ...enhancedProject,
        techStack: json(project.techStack)
      }
    });
  }

  await prisma.post.deleteMany({
    where: {
      content: {
        in: [
          "Thinking about the difference between faster output and better judgment. The best tools should improve both.",
          "A polished admin interface is a promise: future updates will not feel like punishment.",
          "Today’s build note: keep the system expressive where people browse, calm where people operate."
        ]
      }
    }
  });

  const posts = [
    "我最近一直在思考：更快的输出和更好的判断不是一回事。真正好的工具应该同时提升两者。",
    "一个打磨过的后台界面，其实是在向未来承诺：后续维护不会变成痛苦。",
    "今天的构建笔记：前台要有表达力，后台要足够冷静，二者服务的是同一个长期系统。"
  ];

  for (const content of posts) {
    const exists = await prisma.post.findFirst({ where: { content } });
    if (!exists) {
      await prisma.post.create({ data: { content, visible: true } });
    }
  }

  await prisma.skill.deleteMany({
    where: {
      name: {
        in: [
          "Full-stack Development",
          "Product Thinking",
          "AI Workflow",
          "Design Sense",
          "Automation",
          "Business Understanding",
          "Content Creation",
          "Problem Solving"
        ]
      }
    }
  });

  const skills = [
    ["全栈开发", "工程", 94, "从界面到数据模型，构建可靠、可维护的产品系统。"],
    ["产品思维", "产品", 90, "把模糊想法转化成清晰、可执行的产品决策。"],
    ["AI 工作流", "AI", 92, "为研究、写作、开发和复盘设计实用的 AI 循环。"],
    ["设计审美", "设计", 88, "平衡视觉冲击、可用性和品牌表达。"],
    ["自动化", "工程", 86, "用安全、可观测的系统消除重复劳动。"],
    ["商业理解", "策略", 82, "把技术选择与结果、杠杆和长期价值连接起来。"],
    ["内容表达", "沟通", 84, "用结构和审美解释复杂想法。"],
    ["问题解决", "执行", 91, "找到从问题到结果的最短可靠路径。"],
    ["Next.js", "前端", 92, "构建可维护、可部署、可扩展的内容系统和全栈产品。"],
    ["SwiftUI", "iOS", 86, "用声明式界面构建原生 iOS 产品的首页、发布、私信、通知和设置体验。"],
    ["SwiftData", "iOS", 82, "为原生 App 设计本地持久化、离线优先、迁移恢复和同步缓存。"],
    ["Python", "后端", 84, "用轻量服务快速跑通 API 契约、业务状态和部署边界。"],
    ["SQLite", "数据库", 83, "在早期产品和单机部署里提供稳定、简单、可迁移的数据基础。"]
  ];

  for (const [index, skill] of skills.entries()) {
    const [name, category, level, description] = skill;
    const existing = await prisma.skill.findFirst({ where: { name: String(name) } });
    const data = {
      name: String(name),
      category: String(category),
      level: Number(level),
      description: String(description),
      sortOrder: index + 1
    };
    if (existing) {
      await prisma.skill.update({ where: { id: existing.id }, data });
    } else {
      await prisma.skill.create({ data });
    }
  }

  const guides = [
    ["ai-fullstack-development-guide", "我如何用 AI 辅助全栈开发", "AI 工作流指南", ["AI", "全栈", "开发"], "进阶", "希望把 AI 稳定放进开发流程的开发者"],
    ["idea-to-product-prototype", "我如何用 AI 从想法到产品原型", "AI 工作流指南", ["AI", "产品", "原型"], "中级", "想把模糊想法快速验证的人"],
    ["nextjs-project-structure", "Next.js 项目结构设计指南", "全栈开发指南", ["Next.js", "架构", "工程"], "中级", "正在搭建长期项目的开发者"],
    ["admin-system-design", "后台系统设计方法", "全栈开发指南", ["后台", "CMS", "体验"], "进阶", "需要设计运营工具的人"],
    ["machi-ios-offline-first-guide", "Machi iOS 离线优先工程指南", "iOS 工程指南", ["SwiftUI", "SwiftData", "离线优先", "Machi"], "进阶", "正在构建真实 SwiftUI 产品的开发者"],
    ["machi-web-backend-sync-guide", "Machi Web 与统一后端同步指南", "全栈开发指南", ["Next.js", "Python", "SQLite", "SSE", "双端同步"], "进阶", "需要让 Web 与 App 共享同一套 API 的开发者"],
    ["mvp-feature-judgement", "如何判断一个功能是否值得做", "产品思维指南", ["MVP", "产品", "判断"], "入门", "正在做产品取舍的人"],
    ["premium-web-design-checklist", "如何判断一个网页是否高级", "设计审美指南", ["设计", "视觉系统", "审美"], "中级", "想提升页面质感的创作者"],
    ["project-review-method", "我如何做项目复盘", "项目复盘指南", ["复盘", "项目", "长期主义"], "中级", "希望从项目中持续积累能力的人"],
    ["personal-brand-system", "如何构建个人品牌内容系统", "成长与方法论", ["个人品牌", "内容", "系统"], "进阶", "想长期输出并展示能力的人"]
  ];

  const guideOverrides: Record<string, { excerpt: string; content: string; readingTime?: string }> = {
    "ai-fullstack-development-guide": {
      excerpt:
        "我在真实全栈项目里使用 AI 的方式：先让它帮助拆问题、看风险、写候选方案，再让构建、测试和人工判断决定最终结果。",
      readingTime: "约 6 分钟阅读",
      content: `# 我如何用 AI 辅助全栈开发

AI 写代码很快，但全栈项目真正难的地方不是速度，而是判断：数据模型是否稳定、接口边界是否清楚、后台是否能维护、部署后是否可验证。

## 我不会一开始就让 AI 写完整项目

我会先把目标用户、核心场景、必须完成的动作和不能破坏的边界写清楚。比如个人网站重构时，前台可以大幅改视觉，但后台、数据库、API 和部署脚本不能被破坏。这个边界比任何提示词都重要。

## 分工方式

1. ChatGPT 适合展开需求、梳理页面结构、生成检查清单。
2. Codex 适合进入仓库，读代码、改组件、跑构建、修类型错误。
3. Cursor 适合日常编辑器内的局部重构和快速理解上下文。

## 开发流程

- 先读目录、依赖、路由和数据模型。
- 再找出可大改的前台边界，以及必须保持稳定的后台/API 边界。
- 用 AI 生成候选实现，但人工决定是否符合项目风格。
- 每次大改后跑 lint、build 和浏览器验收。

## 判断标准

如果 AI 给出的代码让系统更难维护，我会宁愿慢一点重写。真正有效的 AI 协作，不是把所有事情交给模型，而是让模型帮我更快看见可能性、风险和遗漏。`
    },
    "idea-to-product-prototype": {
      excerpt:
        "从一句模糊想法开始，先用 AI 扩展场景和风险，再压缩成用户路径、数据模型和可以跑起来的第一版原型。",
      readingTime: "约 5 分钟阅读",
      content: `# 我如何用 AI 从想法到产品原型

一个想法刚出现时通常很兴奋，但也很松散。AI 可以快速展开可能性，但如果没有产品判断，展开得越快，越容易把项目带偏。

## 第一步：把想法落到具体场景

我会先问四个问题：谁会用、什么时候用、现在怎么解决、为什么这个方案更好。AI 可以帮我补充边缘场景和反例，但最终要回到真实用户动作。

## 第二步：找到最小可验证路径

原型不需要覆盖所有功能，只需要验证最关键的行为。比如内容系统的第一版，不需要一开始就做复杂推荐算法，但必须能清楚展示文章、项目、指南之间的路径关系。

## 第三步：让数据模型先稳定

很多原型失败不是因为界面不好看，而是数据模型一开始就混乱。用户、内容、状态、权限、时间线这些实体要先分清楚，再进入界面打磨。

## 第四步：把原型做成可以复盘的东西

我会记录哪些判断来自 AI，哪些来自实际约束，哪些在实现中被推翻。这样项目不是一次性产物，而是能沉淀成下一次的速度。`
    },
    "nextjs-project-structure": {
      excerpt:
        "我组织 Next.js 项目时，会先分清路由、数据层、前台组件、后台组件和通用 UI，避免项目长大后所有代码挤在一起。",
      readingTime: "约 6 分钟阅读",
      content: `# Next.js 项目结构设计指南

Next.js 很适合做个人网站、CMS 和全栈产品，但项目结构如果一开始不清楚，后面会很快变成页面文件、接口和组件互相缠绕。

## 我会先划四条边界

1. app/ 负责路由、页面、API 和 SEO。
2. components/site/ 负责前台展示体验。
3. components/admin/ 负责后台管理体验。
4. lib/ 负责数据访问、鉴权、Markdown、SEO 和工具函数。

## 前台和后台不要混在一起

前台需要表达力、动效、视觉节奏；后台需要稳定、密度、可预期。它们可以共享基础组件，但不应该共享页面思路。

## 数据读取保持集中

我倾向在 lib/data.ts 里放公开数据读取和 normalize 逻辑。这样页面不用知道 tags、techStack 这些字段在数据库里是 JSON 字符串，也方便后续切换数据源。

## 什么时候加抽象

只有当重复已经影响维护，或者一个概念在多个页面都稳定出现时，我才会提取组件。过早抽象会让项目看起来工程化，实际上更难改。`
    },
    "admin-system-design": {
      excerpt:
        "后台系统不是把表单堆起来，而是让未来的内容维护、状态校验、错误恢复和权限边界都更清楚。",
      readingTime: "约 5 分钟阅读",
      content: `# 后台系统设计方法

很多个人网站前台很好看，但后台一打开就像临时拼出来的工具。真正能长期维护的内容系统，后台体验必须足够冷静。

## 我最在意的四件事

- 字段含义清楚，编辑时不需要猜。
- 列表能快速扫描状态和更新时间。
- 删除、发布、隐藏等动作必须有明确反馈。
- 表单校验在前端和 API 边界都要存在。

## 后台不是营销页

后台不需要巨大的 Hero，也不需要复杂装饰。它应该像一个稳定控制台：信息密度适中、按钮位置可预期、错误状态清楚、保存动作有反馈。

## 数据模型决定后台体验

如果内容模型本身含糊，后台再漂亮也没用。文章、项目、指南、资源、Now、Playbook、Manifesto 这些模块各自承担不同角色，字段就应该围绕它们的真实用途设计。

## 长期维护标准

一个好的后台，应该让三个月后的自己仍然愿意更新内容。维护体验也是产品体验的一部分。`
    },
    "machi-ios-offline-first-guide": {
      excerpt:
        "把 Machi iOS 的 SwiftUI、SwiftData、Repository、Service、Keychain 与 RemoteSyncService 拆成一套可复用的离线优先工程指南。",
      readingTime: "约 7 分钟阅读",
      content: `# Machi iOS 离线优先工程指南

Machi iOS 是一个城市本地生活与同城社交客户端，它不是一个只调用接口的壳。用户需要在首页、发现、发布、私信、通知和个人页之间高频切换，也可能在弱网环境下继续浏览和起草内容。

## 架构目标

- 本地数据层足够稳定，离线时仍能提供基础体验。
- 远端同步流程可恢复，避免一次失败导致状态混乱。
- 账号凭据和用户数据有清晰边界。
- iOS 与 Web 共用后端事实，但保留平台交互差异。

## 分层方式

1. SwiftUI 负责界面、状态绑定和 NavigationStack 路由。
2. SwiftData 负责本地持久化、Schema 版本和迁移恢复。
3. Repository 负责隔离本地实体读写。
4. Service 负责认证、网络、媒体、同步、地区目录和通知偏好。
5. Keychain 负责 Bearer Token，避免敏感凭据明文保存。

## 离线优先流程

用户先和本地状态交互，系统再根据连接状态决定是否同步。ConnectivityMonitor 负责感知网络变化，RemoteSyncService 负责把本地草稿、Feed 状态和互动数据与统一后端对齐。

## 迁移与恢复

SwiftData 的价值不只是保存数据，更重要的是让 App 可以在模型演进时继续运行。Machi 使用版本化 Schema 和迁移恢复策略，遇到本地容器异常时优先尝试修复，而不是直接让用户失去使用入口。

## 工程判断

我选择无第三方依赖，是为了让第一版产品的工程边界更干净。SwiftUI、SwiftData、Foundation、Security、Network 和 URLSession 已经足够支撑一个可运行、可维护、可同步的原生客户端。`
    },
    "machi-web-backend-sync-guide": {
      excerpt:
        "拆解 Machi Web 如何用 Next.js、React、TypeScript、Python、SQLite、REST API 与 SSE 支撑 Web/iOS 双端同步。",
      readingTime: "约 7 分钟阅读",
      content: `# Machi Web 与统一后端同步指南

Machi Web 和 Machi iOS 共享同一套账号、数据库、API 和核心业务状态。Web 不是宣传页，而是产品系统的另一端：它需要承接 Feed、发帖、评论、互动、私信、通知、媒体、设置、会员和支付状态。

## 系统组成

- Web 客户端：Next.js 15、React 19、TypeScript、Tailwind CSS、Zustand、TanStack Query。
- 统一后端：Python 标准库服务，集中承载 REST API 与 SSE。
- 数据库：SQLite，包含 19 张业务表、索引、WAL、soft delete 和 cursor 分页。
- 实时通道：Server-Sent Events，用于通知与私信状态更新。

## 同步原则

后端是唯一真相源。Web 和 iOS 可以拥有不同的页面结构、组件密度和交互方式，但账号、用户、帖子、评论、点赞、收藏、转发、私信、通知、会员与支付状态必须一致。

## API 契约

Machi 后端覆盖 auth、users、feed、posts、comments、search、topics、notifications、conversations、messages、media、settings、devices、drafts、events、membership 和 payment 等模块。接口返回会补充兼容字段，确保 Web 与 iOS 的 DTO 都能稳定解码。

## Web 客户端策略

Web 端用 TanStack Query 管理远端请求与缓存，用 Zustand 承接轻量全局状态，用 Tailwind 对齐 iOS 视觉 token。桌面端偏三栏信息密度，移动端保留底部导航，让 Web 也有接近 App 的使用节奏。

## 复盘重点

双端同步最难的不是多写一个页面，而是持续维护数据契约。只要序列化字段、分页规则、删除语义、权限边界和实时事件没有统一，Web 与 iOS 很快就会变成两个彼此打架的产品。`
    },
    "mvp-feature-judgement": {
      excerpt:
        "判断一个功能是否值得做，我会先看问题密度、使用频率、替代方案和维护成本，而不是只看它是否显得酷。",
      readingTime: "约 5 分钟阅读",
      content: `# 如何判断一个功能是否值得做

功能判断最容易被两个东西带偏：一个是新鲜感，一个是页面完整感。看起来很丰富，不代表真的值得做。

## 先看问题密度

这个功能解决的是不是高频、真实、具体的问题？如果用户只是偶尔觉得有点方便，它可能不该进入第一版。

## 再看成功信号

我会提前写下怎样算有效：用户是否更快完成动作、是否减少重复输入、是否降低维护成本、是否让内容关系更清楚。

## 然后看维护成本

每个功能都会带来状态、异常、权限、文案、移动端和后台维护成本。一个没有验证价值的功能，会长期占用注意力。

## 最后决定第一版边界

MVP 不是粗糙版本，而是最小可验证版本。它应该足够小，但核心路径必须认真。`
    },
    "premium-web-design-checklist": {
      excerpt:
        "我判断网页高级感时，会看首屏重心、排版节奏、玻璃卡片、动效克制、移动端阅读和每个状态是否清楚。",
      readingTime: "约 5 分钟阅读",
      content: `# 如何判断一个网页是否高级

高级感不是某一种颜色，也不是把所有东西都做成玻璃和渐变。真正高级的网页，第一眼有记忆点，继续看又不累。

## 首屏要有视觉中心

只有大标题不够。用户需要一个能代表网站气质的装置、截图、仪表盘、产品画面或交互场景。视觉中心要帮助理解，而不是抢走阅读。

## 排版要有节奏

每个 Section 不应该长得一样。标题、正文、卡片、图像和留白需要有强弱变化。正文宽度不能过长，移动端不能拥挤。

## 卡片要承载内容

玻璃卡片不是透明框。它应该有稳定背景、清楚边框、柔和阴影、内部微光和明确 hover 状态。

## 动效要像呼吸

动效应该让页面更有生命，而不是让阅读变困难。鼠标光场、按钮流光、滚动出现都要轻，不能出现脏点和黑色粒子。`
    },
    "project-review-method": {
      excerpt:
        "一次有效复盘要写清背景、目标、关键取舍、踩坑、结果和下一次可复用的清单，而不是只总结做得不错。",
      readingTime: "约 5 分钟阅读",
      content: `# 我如何做项目复盘

复盘不是给项目写结尾，也不是证明自己做对了。复盘的价值是让下一次更快、更稳、更清楚。

## 我会先写背景

项目为什么开始，当时有什么约束，哪些东西必须保持稳定，哪些地方允许大改。如果背景不写清楚，后面的取舍就很难判断。

## 再写关键取舍

比如个人网站重构时，我允许大幅改前台页面和动效，但不破坏后台、数据库、API 和部署脚本。这个取舍决定了实现路线。

## 记录失败和犹豫

只写成功会让复盘失真。我会记录哪些方案被放弃，为什么放弃，哪些问题是构建时才暴露出来的。

## 最后沉淀清单

每个项目都应该留下可复用的检查清单：上线前检查、移动端检查、内容检查、性能检查、部署检查。复盘要能服务下一次行动。`
    },
    "personal-brand-system": {
      excerpt:
        "个人品牌网站不只是展示自己，而是把项目、文章、指南、资源、Now 和复盘组织成能长期积累信任的系统。",
      readingTime: "约 6 分钟阅读",
      content: `# 如何构建个人品牌内容系统

个人品牌不是把自己包装得更大声，而是让真实能力被看见、被理解、被持续验证。

## 内容模块要分工

项目负责证明执行力，文章负责留下判断，指南负责沉淀方法，资源库负责展示工具选择，Now 负责说明当前状态，Manifesto 负责表达长期原则。

## 不要只做作品列表

作品列表能展示结果，但很难展示思考过程。一个好的 Case Study 应该说清背景、问题、角色、技术架构、产品判断、核心挑战、结果和复盘。

## 让内容互相连接

访问者可能从项目进入，也可能从 Guide 进入。内容系统要提供下一步阅读，让一个页面自然带到另一个页面。

## 长期主义靠维护体验

如果更新内容很麻烦，网站很快会停在发布当天。后台、内容模型、搜索、推荐路径和部署流程，都是个人品牌系统的一部分。`
    }
  };

  for (const [index, guide] of guides.entries()) {
    const [slug, title, category, tags, difficulty, audience] = guide;
    const slugKey = String(slug);
    const override = guideOverrides[slugKey];
    const featuredGuide = index < 4 || slugKey.startsWith("machi-");
    const excerpt = override?.excerpt || `${title}：围绕真实项目约束整理目标、边界、步骤和上线前检查。`;
    const content = override?.content || `# ${title}

这篇指南来自真实构建经验，目标是把一个容易抽象化的话题拆成可以立刻使用的判断框架。

## 核心要点

- 先定义目标，再选择工具。
- 先验证关键路径，再打磨细节。
- 记录每一次取舍，形成可复盘的证据。

## 步骤清单

1. 写下当前问题和期望结果。
2. 列出约束、风险和不可妥协的标准。
3. 用最小可行版本验证核心假设。
4. 把过程沉淀成模板、清单或后台内容。

## 方法论

我会优先寻找能减少未来维护成本的方案。好的系统不是一次性看起来完整，而是每次迭代后都更容易继续生长。

## 下一步

把这篇指南连接到具体项目或文章里，形成从方法到案例的探索路径。`;

    await prisma.guide.upsert({
      where: { slug: slugKey },
      update: {
        title: String(title),
        excerpt,
        content,
        category: String(category),
        tags: json(tags),
        difficulty: String(difficulty),
        audience: String(audience),
        readingTime: override?.readingTime || "约 4 分钟阅读",
        featured: featuredGuide,
        status: "PUBLISHED",
        publishedAt: new Date()
      },
      create: {
        slug: slugKey,
        title: String(title),
        excerpt,
        content,
        category: String(category),
        tags: json(tags),
        difficulty: String(difficulty),
        audience: String(audience),
        readingTime: override?.readingTime || "约 4 分钟阅读",
        featured: featuredGuide,
        status: "PUBLISHED",
        publishedAt: new Date()
      }
    });
  }

  const resources = [
    ["Codex", "https://openai.com/codex", "AI 工具", ["AI", "编程"], "适合把复杂开发任务拆成可持续推进的协作流程。", "代码实现、审查、迁移和自动化任务。"],
    ["Cursor", "https://cursor.com", "AI 工具", ["IDE", "AI"], "适合在编辑器里快速探索代码语境。", "日常开发、重构、快速理解项目结构。"],
    ["Next.js", "https://nextjs.org", "开发资源", ["Next.js", "全栈"], "生态成熟，适合构建内容、后台和产品体验结合的网站。", "个人网站、CMS、全栈产品。"],
    ["React", "https://react.dev", "开发资源", ["React", "前端"], "适合构建高互动、状态复杂且需要长期维护的 Web 客户端。", "Machi Web、后台控制台、内容系统界面。"],
    ["SwiftUI", "https://developer.apple.com/xcode/swiftui/", "开发资源", ["SwiftUI", "iOS"], "声明式界面能让原生客户端在复杂导航和状态下保持清晰结构。", "Machi iOS 首页、发布、私信、通知和设置界面。"],
    ["SwiftData", "https://developer.apple.com/xcode/swiftdata/", "开发资源", ["SwiftData", "iOS", "离线优先"], "适合把本地持久化、模型迁移和离线体验放进原生 App 的工程主线。", "Machi iOS 本地 Feed、草稿、同步缓存和迁移恢复。"],
    ["Python 标准库 HTTP 服务", "https://docs.python.org/3/library/http.server.html", "开发资源", ["Python", "后端"], "轻量后端可以先把 API 契约、数据状态和业务边界跑通。", "Machi 统一后端的 REST API、SSE 和本地部署。"],
    ["SQLite", "https://www.sqlite.org", "开发资源", ["SQLite", "数据库"], "适合中小型产品快速建立可靠的数据真相源，并通过索引、WAL 和分页提升稳定性。", "Machi 账号、帖子、评论、互动、通知和私信数据。"],
    ["Prisma", "https://www.prisma.io", "开发资源", ["数据库", "ORM"], "让数据模型、迁移和类型系统保持在同一个工程节奏里。", "内容模型、后台管理、数据库迁移。"],
    ["Framer Motion", "https://motion.dev", "设计工具", ["动效", "React"], "能把微交互做得自然，同时保持工程可控。", "页面过渡、滚动出现、磁吸交互。"],
    ["Spline", "https://spline.design", "设计参考", ["3D", "视觉"], "适合观察明亮空间感、流体视觉和轻量 3D 表达。", "首屏视觉、品牌概念、空间构图。"],
    ["Linear", "https://linear.app", "设计参考", ["产品", "界面"], "它的层级、节奏和运营界面细节非常值得学习。", "后台、状态、列表和信息密度设计。"],
    ["Vercel", "https://vercel.com", "设计参考", ["开发者品牌", "产品"], "开发者品牌表达和技术内容组织都很克制。", "技术品牌、案例展示、文档入口。"]
  ];

  for (const [index, resource] of resources.entries()) {
    const [title, url, category, tags, reason, useCase] = resource;
    const data = {
      title: String(title),
      url: String(url),
      description: `${title} 是我在真实项目里常用或长期参考的资源。`,
      category: String(category),
      tags: json(tags),
      reason: String(reason),
      useCase: String(useCase),
      featured: index < 4
    };
    const existing = await prisma.resource.findFirst({ where: { title: String(title) } });
    if (existing) {
      await prisma.resource.update({ where: { id: existing.id }, data });
    } else {
      await prisma.resource.create({ data });
    }
  }

  await prisma.nowItem.deleteMany({
    where: {
      title: {
        in: [
          "重做明亮流体个人网站",
          "整理 Machi 双端项目资料",
          "复盘 Machi iOS 离线优先架构",
          "复盘 Machi Web 统一后端",
          "整理 AI 工作流指南",
          "完善后台内容管理",
          "学习更高级的流体视觉表达",
          "构建内容推荐路径",
          "写下长期主义原则"
        ]
      }
    }
  });

  const nowItems = [
    ["Machi App 上架准备", "iOS / Android 客户端正在整理截图、隐私说明、商店文案和最后的功能检查。", "Build", "进行中", 80],
    ["日本 Web / 全栈求职", "围绕 Web 应用、前端、全栈、自社服务和移动端相关岗位整理简历与作品。", "Career", "进行中", 65],
    ["写开发笔记", "文章页保留给后台发布真实心得：踩坑、架构取舍、上架准备和项目复盘。", "Write", "刚开始", 20]
  ];

  for (const [index, item] of nowItems.entries()) {
    const [title, description, type, status, progress] = item;
    const data = { title: String(title), description: String(description), type: String(type), status: String(status), progress: Number(progress), sortOrder: index + 1 };
    const existing = await prisma.nowItem.findFirst({ where: { title: String(title) } });
    if (existing) {
      await prisma.nowItem.update({ where: { id: existing.id }, data });
    } else {
      await prisma.nowItem.create({ data });
    }
  }

  const playbooks = [
    ["product-judgement-framework", "产品判断框架", "当一个功能看起来很有吸引力，但资源有限时。", ["先看问题密度", "再看使用频率", "最后看维护成本"], ["写清目标用户", "定义成功信号", "列出不做的理由", "用最小版本验证"], "如果一个功能只能让页面显得更丰富，却不能提高用户完成目标的概率，我会推迟它。"],
    ["development-workflow", "开发工作流", "从需求到上线，需要稳定推进而不是临场发挥时。", ["先建数据模型", "再定接口边界", "最后打磨体验"], ["拆模型", "写校验", "接后台", "跑构建", "浏览器验收"], "我会优先让系统真实可运行，再逐步提升视觉和交互。"],
    ["machi-dual-platform-sync-playbook", "Machi 双端同步方法论", "当 iOS App 与 Web 客户端必须共享账号、Feed、互动、私信、通知和会员状态时。", ["后端是真相源", "DTO 要兼容新旧客户端", "平台差异留在交互层"], ["列出共享状态", "定义 REST 与 SSE 契约", "补齐序列化兼容字段", "分别跑 Web 与 iOS 验收"], "Machi 的 Web 和 iOS 不追求界面完全一致，但用户、帖子、互动和支付状态必须来自同一套后端事实。"],
    ["offline-first-ios-playbook", "离线优先 iOS 方法论", "当原生 App 需要在弱网或离线场景下继续可用时。", ["本地模型先稳定", "同步流程要可恢复", "敏感凭据必须隔离"], ["建立 SwiftData Schema", "封装 Repository", "用 Service 管理远端同步", "设计迁移与降级恢复"], "Machi iOS 可以离线浏览和起草内容，联网登录后再由 RemoteSyncService 与后端状态对齐。"],
    ["ai-collaboration-workflow", "AI 协作工作流", "需要快速探索复杂方案，但仍要保持判断权时。", ["人负责方向", "AI 负责展开", "证据负责验收"], ["提出目标", "生成候选", "筛掉风险", "实现验证"], "AI 生成的内容不能直接成为结论，必须经过项目上下文和运行结果验证。"],
    ["design-quality-check", "设计判断原则", "页面看起来还行，但缺少高级感和记忆点时。", ["层级先于装饰", "动效服务内容", "颜色承担分区"], ["看首屏", "看留白", "看卡片", "看移动端", "看状态反馈"], "如果背景很美却影响阅读，这不是设计进步，而是噪音增加。"],
    ["review-system", "项目复盘方法", "一个项目完成后，需要把经验变成下一次的速度时。", ["记录取舍", "记录失败", "记录可复用模块"], ["写背景", "列挑战", "复盘方案", "沉淀清单"], "复盘不是证明自己做对了，而是让未来的自己更少重复犯错。"]
  ];

  for (const [index, playbook] of playbooks.entries()) {
    const [slug, title, scenario, principles, steps, example] = playbook;
    await prisma.playbook.upsert({
      where: { slug: String(slug) },
      update: {
        title: String(title),
        scenario: String(scenario),
        principles: json(principles),
        steps: json(steps),
        example: String(example),
        relatedLinks: json(["/guide", "/projects", "/blog"]),
        featured: index < 3
      },
      create: {
        slug: String(slug),
        title: String(title),
        scenario: String(scenario),
        principles: json(principles),
        steps: json(steps),
        example: String(example),
        relatedLinks: json(["/guide", "/projects", "/blog"]),
        featured: index < 3
      }
    });
  }

  const manifestoItems = [
    ["技术是把判断变成现实的媒介", "我喜欢技术，是因为它能把抽象判断转化成可被使用、可被验证、可被改进的东西。"],
    ["审美不是装饰，而是系统", "高级感来自信息层级、节奏、留白、反馈和一致性，而不只是颜色漂亮。"],
    ["AI 应该放大人的判断", "我不把 AI 当作替代者，而是把它设计进探索、起草、实现和复盘的循环里。"],
    ["长期主义需要可维护系统", "如果一个作品只能在发布当天成立，它就还不是系统。"],
    ["好的产品减少摩擦", "真正有价值的界面，应该让用户更快理解、更少犹豫、更自然完成行动。"],
    ["创造需要证据", "我更相信可以被项目、文章、复盘和持续输出证明的能力。"]
  ];

  for (const [index, item] of manifestoItems.entries()) {
    const [title, content] = item;
    const data = { title, content, sortOrder: index + 1, visible: true };
    const existing = await prisma.manifestoItem.findFirst({ where: { title } });
    if (existing) {
      await prisma.manifestoItem.update({ where: { id: existing.id }, data });
    } else {
      await prisma.manifestoItem.create({ data });
    }
  }

  const collections = [
    ["ai-workflow-path", "AI 工作流路线", "从 AI 开发、原型到自动化的精选内容路径。", "guide", ["ai-fullstack-development-guide", "idea-to-product-prototype", "ai-to-product-prototype-workflow"]],
    ["product-thinking-path", "产品思维路线", "理解我如何判断功能、设计 MVP 和推进实现。", "mixed", ["mvp-feature-judgement", "product-judgement-framework", "personal-intelligence-dashboard"]],
    ["design-aesthetic-path", "设计审美路线", "关于流体渐变、玻璃卡片和高级网页判断的内容集合。", "mixed", ["premium-web-design-checklist", "fluid-gradient-personal-site-principles", "bright-content-universe-website"]],
    ["engineering-path", "工程能力路线", "从全栈结构、后台系统到部署维护的工程路径。", "mixed", ["nextjs-project-structure", "admin-system-design", "brand-cms-creator-portfolios"]],
    ["machi-platform-path", "Machi 双端产品路线", "集中浏览 Machi iOS、Machi Web、统一后端、离线优先和双端同步相关内容。", "mixed", ["machi-ios-native-city-life-app", "machi-web-unified-python-backend", "machi-ios-offline-first-architecture", "machi-web-ios-shared-backend-sync", "machi-ios-offline-first-guide", "machi-web-backend-sync-guide", "machi-dual-platform-sync-playbook"]]
  ];

  for (const [index, collection] of collections.entries()) {
    const [slug, title, description, type, itemIds] = collection;
    await prisma.contentCollection.upsert({
      where: { slug: String(slug) },
      update: {
        title: String(title),
        description: String(description),
        type: String(type),
        itemIds: json(itemIds),
        featured: index < 3
      },
      create: {
        slug: String(slug),
        title: String(title),
        description: String(description),
        type: String(type),
        itemIds: json(itemIds),
        featured: index < 3
      }
    });
  }

  await prisma.timelineItem.deleteMany({
    where: {
      title: {
        in: [
          "Built a cross-discipline foundation",
          "Shipped full-stack product systems",
          "Integrated AI into daily work",
          "Designing a personal brand platform"
        ]
      }
    }
  });

  const timeline = [
    ["建立跨学科能力基础", "把工程、产品思维和设计实践逐步整合成一种统一的执行方式。", "2021", "学习"],
    ["交付全栈产品系统", "从单点功能推进到可长期维护的产品架构和运营工具。", "2023", "项目"],
    ["把 AI 融入日常工作", "为构思、实现、写作和复盘建立可重复使用的 AI 工作流。", "2025", "里程碑"],
    ["构建个人品牌平台", "把作品、文章和动态转化成一个持续生长的公开系统。", "现在", "当前"],
    ["扩展内容地图", "新增指南、资源库、方法论、当前状态和个人宣言，让网站从展示变成探索。", "2026", "内容"],
    ["重构明亮流体视觉", "用轻盈渐变、玻璃质感和内容地图替代单一暗色科技风。", "2026", "设计"]
  ];

  for (const [index, item] of timeline.entries()) {
    const [title, description, date, type] = item;
    const existing = await prisma.timelineItem.findFirst({ where: { title } });
    const data = {
      title,
      description,
      date,
      type,
      sortOrder: index + 1
    };
    if (existing) {
      await prisma.timelineItem.update({ where: { id: existing.id }, data });
    } else {
      await prisma.timelineItem.create({ data });
    }
  }

  console.log(`初始化完成。后台账号：${adminAccount}。密码来自 ADMIN_PASSWORD_HASH 或 ADMIN_PASSWORD。`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
