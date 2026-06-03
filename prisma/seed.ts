import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function json(value: unknown) {
  return JSON.stringify(value);
}

async function main() {
  const adminAccount = "yaokai";
  const adminPassword = "kaixuan2390166";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

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
    siteDescription: "一个关于技术、设计、产品思维与 AI 工作流的明亮内容宇宙。",
    heroTitle: "Building beautiful, intelligent digital experiences.",
    heroSubtitle:
      "我用技术、设计、产品思维与 AI 工作流，把复杂想法变成精致、可用、可增长的数字作品。",
    avatarUrl: "/images/avatar-yaokai.svg",
    email: "hello@example.com",
    socials: json([
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "X", href: "https://x.com/" }
    ]),
    seoTitle: "姚凯 - 明亮内容宇宙",
    seoDescription:
      "一个明亮流体渐变风格的个人网站，展示作品、指南、文章、方法论、资源库与 AI 工作流。",
    ogImage: "/images/og-cover.svg",
    theme: "light-fluid",
    icp: "",
    now: json([
      "设计明亮流体风格的个人内容宇宙。",
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

## 内容宇宙

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
    }
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        ...article,
        tags: json(article.tags),
        status: "PUBLISHED",
        seoTitle: article.title,
        seoDescription: article.excerpt,
        publishedAt: new Date()
      },
      create: {
        ...article,
        tags: json(article.tags),
        status: "PUBLISHED",
        seoTitle: article.title,
        seoDescription: article.excerpt,
        publishedAt: new Date()
      }
    });
  }

  const projects = [
    {
      title: "个人智能工作台",
      slug: "personal-intelligence-dashboard",
      excerpt:
        "一个整合笔记、目标、内容灵感和 AI 辅助规划的个人操作系统。",
      category: "效率工具",
      techStack: ["Next.js", "TypeScript", "Prisma", "OpenAI", "自动化"],
      role: "产品设计、全栈开发与工作流架构",
      challenge:
        "很多个人知识系统只会收集信息，却无法持续转化成行动。",
      solution:
        "我围绕关键决策点设计了捕捉、整理、计划和复盘四个核心模块。",
      result:
        "系统减少了上下文切换，把零散思考变成可见、可复盘的执行循环。",
      featured: true,
      sortOrder: 1,
      content: `## 项目背景

这个项目探索的是：个人操作系统如何变得真正实用，而不是变成一种形式感很强的自我管理表演。

## 关键功能

- AI 辅助整理
- 周复盘工作台
- 项目与内容管道
- 轻量自动化钩子

## 复盘

最大的经验是：智能产品应该让行动更容易，而不是制造另一个收件箱。`
    },
    {
      title: "创作者个人品牌 CMS",
      slug: "brand-cms-creator-portfolios",
      excerpt:
        "为需要作品深度和编辑控制权的创作者打造的内容管理体验。",
      category: "内容系统",
      techStack: ["Next.js", "Prisma", "Tailwind CSS", "Framer Motion"],
      role: "全栈工程师与视觉系统设计者",
      challenge:
        "很多个人网站上线时很好看，但后续维护成本很高。",
      solution:
        "我设计了文章、项目、动态、站点设置和复用视觉模块组成的内容模型。",
      result:
        "前台保留强表达力，后台保持高效、清晰、可长期运营。",
      featured: true,
      sortOrder: 2,
      content: `## 项目背景

目标是让个人品牌发布系统像一个产品，而不是一堆难以维护的页面。

## 设计说明

前台使用高对比视觉节奏，后台使用克制、稳定的运营界面。

## 最终结果

访问者能留下清晰印象，站点所有者也能长期维护内容。`
    },
    {
      title: "重复工作的自动化工作室",
      slug: "automation-studio-repeated-work",
      excerpt:
        "一个把重复手工流程转化成可监控工作流的小型自动化控制台。",
      category: "自动化",
      techStack: ["Node.js", "队列", "PostgreSQL", "仪表盘"],
      role: "技术架构与实现负责人",
      challenge:
        "重复手工操作容易出错，而且往往等到失败后才被发现。",
      solution:
        "我引入工作流模板、运行历史、重试控制和运营提醒。",
      result:
        "团队获得了更清晰的责任边界、更少的重复错误和更快的恢复路径。",
      featured: false,
      sortOrder: 3,
      content: `## 项目背景

自动化只有在可以被信任时才有价值。

## 架构思考

系统重点关注清晰的状态流转、安全重试和可观测结果。

## 结果

最重要的变化不是技术，而是团队不再把重复手工劳动视为理所当然。`
    },
    {
      title: "明亮内容宇宙个人网站",
      slug: "bright-content-universe-website",
      excerpt:
        "一个把指南、作品、文章、资源库和方法论连接起来的明亮个人品牌产品。",
      category: "个人品牌",
      techStack: ["Next.js", "Prisma", "Framer Motion", "内容架构", "流体渐变"],
      role: "视觉系统、内容模型、全栈实现与后台架构",
      challenge:
        "普通个人网站容易停留在作品列表和博客列表，缺少持续探索和长期沉淀的结构。",
      solution:
        "我把内容拆成 Guide、Playbook、Library、Now、Manifesto 等模块，并用明亮流体视觉系统统一体验。",
      result:
        "网站从静态展示升级为可以长期扩展的内容宇宙，访问者能从不同路径理解我的能力。",
      featured: true,
      sortOrder: 4,
      content: `## 项目背景

这个项目的目标不是做一个普通个人主页，而是做一个可以长期生长的个人内容产品。

## 核心决策

- 用 Guide 承载可复用方法。
- 用 Playbook 展示做事原则。
- 用 Library 连接工具和资源。
- 用 Case Study 展示真实项目判断。

## 复盘

个人品牌最重要的不是把自己包装得更大声，而是让真实能力有结构、有证据、有路径地被看见。`
    },
    {
      title: "Machi iOS 原生城市生活客户端",
      slug: "machi-ios-native-city-life-app",
      excerpt:
        "一个 SwiftUI + SwiftData 的离线优先 iOS App，覆盖城市信息流、发布、互动、私信、通知、城市频道和会员能力。",
      category: "iOS App",
      techStack: ["SwiftUI", "SwiftData", "Keychain", "URLSession", "MVVM", "Repository", "离线优先"],
      role: "iOS 架构、SwiftUI 实现、本地数据层、同步服务与产品功能设计",
      challenge:
        "城市生活社区需要同时支持复杂互动、离线浏览、草稿暂存、账号同步和双端一致性，不能只是一个简单信息流。",
      solution:
        "我用 SwiftData 构建本地持久层，用 MVVM + Repository + Service 分层管理复杂状态，用 Keychain 管理凭据，并通过 RemoteSyncService 与统一后端对齐。",
      result:
        "App 形成了可离线运行、可恢复、可同步、可扩展的原生客户端基础，支持首页、发现、通知、私信、我的、发布和设置等核心模块。",
      featured: true,
      sortOrder: 5,
      content: `## 项目背景

Machi 是面向城市本地生活和同城社交的 iOS 客户端。它希望把租房、二手、工作、招聘、约饭、活动、问答、避坑经验和本地服务重新组织到城市和语言维度里。

## 我的角色

我负责 iOS 原生客户端的架构设计、SwiftUI 页面实现、本地 SwiftData 数据层、认证与同步服务，以及与 Web / 后端的数据契约对齐。

## 技术架构

- SwiftUI + NavigationStack：声明式 UI 与多 Tab 路由。
- SwiftData：版本化 Schema V5、迁移计划和多级恢复。
- Repository：封装本地实体读写。
- Services：认证、网络、同步、媒体缓存、地区目录、语言和通知偏好。
- Keychain：保存 Bearer Token，避免敏感凭据明文落地。

## 核心挑战

离线优先不是简单缓存。真正的挑战是让用户在未联网时仍能浏览和起草，在恢复连接后又能安全地与后端状态对齐。

## 结果与复盘

Machi iOS 的价值在于它不是一个临时 Demo，而是一个具备真实产品复杂度的原生 App：有本地韧性、有双端同步、有隐私边界，也有长期扩展空间。`
    },
    {
      title: "Machi Web 与统一 Python 后端",
      slug: "machi-web-unified-python-backend",
      excerpt:
        "一个 Next.js Web 客户端 + Python 单文件后端 + SQLite 数据库的生产级本地生活平台，与 iOS 共用账号和 API。",
      category: "Web / 后端",
      techStack: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Python", "SQLite", "SSE", "REST API"],
      role: "全栈架构、API 设计、Web 客户端、后台服务、部署与双端同步契约",
      challenge:
        "Web 与 iOS 必须共享用户、帖子、互动、私信、通知、会员和支付状态，同时还要保留各自平台的交互差异。",
      solution:
        "我用 Python 单文件服务承载统一 API 与 SQLite 数据库，用 Next.js 构建 Web 客户端，并通过序列化兼容字段保证 Web/iOS DTO 能稳定解码。",
      result:
        "系统拥有 80+ REST 端点、SSE 实时通知/私信、19 张数据表、soft delete、cursor 分页、媒体上传和会员支付状态同步能力。",
      featured: true,
      sortOrder: 6,
      content: `## 项目背景

Machi Web 是和 iOS App 并行的 Web 客户端，同时也承载统一后端。它不是单独的宣传页，而是实际产品系统的一部分。

## 技术架构

- Web：Next.js 15、React 19、TypeScript、Tailwind、Zustand、TanStack Query。
- 后端：Python 标准库单文件服务，按 REST API 暴露业务能力。
- 数据：SQLite，包含 19 张表、WAL、索引、soft delete 和 cursor 分页。
- 实时：SSE 用于私信和通知更新。
- 部署：支持 systemd、Nginx、Caddy、Amazon Linux 2023。

## API 能力

统一后端覆盖 auth、users、feed、posts、comments、search、topics、notifications、messages、media、settings、devices、drafts、events、membership 和 payment 等模块。

## 双端同步

Web 和 iOS 可以有不同界面，但必须共享同一套数据事实。为此我在序列化层补充兼容字段，让新旧客户端都能稳定工作。

## 结果与复盘

这个项目训练的是端到端产品系统能力：不仅要写页面，还要处理认证、安全、数据一致性、实时事件、支付边界、双端 DTO 和部署运维。`
    }
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        ...project,
        techStack: json(project.techStack),
        coverImage: `/images/project-${project.sortOrder}.svg`
      },
      create: {
        ...project,
        techStack: json(project.techStack),
        coverImage: `/images/project-${project.sortOrder}.svg`
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
5. Keychain 负责 Bearer Token，避免敏感凭据明文落地。

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
    }
  };

  for (const [index, guide] of guides.entries()) {
    const [slug, title, category, tags, difficulty, audience] = guide;
    const slugKey = String(slug);
    const override = guideOverrides[slugKey];
    const featuredGuide = index < 4 || slugKey.startsWith("machi-");
    const excerpt = override?.excerpt || `${title}：把经验拆成可以执行、验证和复用的步骤，而不是停留在灵感层面。`;
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
      description: `${title} 是我内容宇宙中常用或长期参考的资源。`,
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

  const nowItems = [
    ["重做明亮流体个人网站", "把个人网站从暗色作品集升级成可探索的内容宇宙。", "当前项目", "进行中"],
    ["整理 Machi 双端项目资料", "把本地 iOS 原生客户端、Web 客户端和统一后端的介绍、架构和技术栈加入网站。", "当前项目", "进行中"],
    ["复盘 Machi iOS 离线优先架构", "梳理 SwiftUI、SwiftData、Keychain、Repository、Service 与远端同步的工程取舍。", "正在研究", "进行中"],
    ["复盘 Machi Web 统一后端", "整理 Next.js、React、Python、SQLite、SSE 和 80+ REST 端点如何支撑双端一致性。", "正在研究", "进行中"],
    ["整理 AI 工作流指南", "把日常开发、写作和产品拆解中的 AI 协作方法沉淀成 Guide。", "正在研究", "进行中"],
    ["完善后台内容管理", "让新增内容模型都能在后台清晰管理，不靠硬编码维护。", "当前项目", "进行中"],
    ["学习更高级的流体视觉表达", "研究 mesh gradient、玻璃质感和轻量动效如何服务内容。", "正在学习", "持续"],
    ["构建内容推荐路径", "让项目、文章、指南、资源之间形成可继续探索的路径。", "下一步计划", "计划中"],
    ["写下长期主义原则", "把个人创造、学习和复盘方式沉淀成 Manifesto。", "最近想法", "持续"]
  ];

  for (const [index, item] of nowItems.entries()) {
    const [title, description, type, status] = item;
    const data = { title, description, type, status, sortOrder: index + 1 };
    const existing = await prisma.nowItem.findFirst({ where: { title } });
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
    ["ai-collaboration-workflow", "AI 协作工作流", "需要快速探索复杂方案，但仍要保持判断权时。", ["人负责方向", "AI 负责展开", "证据负责验收"], ["提出目标", "生成候选", "筛掉风险", "落地验证"], "AI 生成的内容不能直接成为结论，必须经过项目上下文和运行结果校验。"],
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
    ["product-thinking-path", "产品思维路线", "理解我如何判断功能、设计 MVP 和推进落地。", "mixed", ["mvp-feature-judgement", "product-judgement-framework", "personal-intelligence-dashboard"]],
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
    ["扩展内容宇宙", "新增指南、资源库、方法论、当前状态和个人宣言，让网站从展示变成探索。", "2026", "内容"],
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

  console.log(`初始化完成。后台账号：${adminAccount} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
