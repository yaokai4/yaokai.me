#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const json = (value) => JSON.stringify(value);

const settings = {
  siteDescription: "姚凯的个人网站，展示 Web / 全栈产品系统、AI 工作流、项目复盘、内容体系与高级界面打磨能力。",
  heroTitle: "姚凯 - Full-stack Web Developer",
  heroSubtitle: "把需求、界面、数据、后台和部署连成可上线、可运营、可复盘的 Web 产品系统。",
  seoTitle: "姚凯 - Full-stack Web Developer & Product-minded Builder",
  seoDescription: "姚凯的个人网站，展示全栈 Web 产品系统、Machi 双端项目、AI 工作流、项目复盘、技术指南与高级 UI 设计判断。"
};

const projectUpdates = {
  "personal-intelligence-dashboard": {
    excerpt: "一个面向个人决策与内容生产的智能工作台，把笔记、目标、项目、灵感和 AI 辅助规划连接成可复盘的执行系统。",
    challenge: "个人知识系统常常只会收集信息，却很难把输入稳定转化成决策、行动和复盘。",
    solution: "我围绕捕捉、整理、计划、执行、复盘五个关键动作设计工作台，并把 AI 放在辅助判断和生成候选方案的位置。",
    result: "系统减少上下文切换，让零散想法进入可见、可追踪、可复用的执行循环。"
  },
  "brand-cms-creator-portfolios": {
    excerpt: "一个面向创作者与个人品牌的内容系统，让作品、文章、指南、资源和站点设置都能长期维护。",
    challenge: "很多个人网站发布当天很好看，但更新成本高，后续内容无法持续生长。",
    solution: "我把项目、文章、指南、动态、资源和视觉模块拆成可管理内容模型，并配套后台维护体验。",
    result: "网站从静态展示升级成可运营的个人内容产品，既有表达力，也能长期更新。"
  },
  "bright-content-universe-website": {
    excerpt: "一个把作品、文章、指南和资源库连接起来的明亮个人品牌产品。",
    challenge: "普通个人网站容易停留在作品列表和博客列表，缺少内容路径、判断证据和持续维护机制。",
    solution: "我用内容地图重新组织 Guide、Library 和 Case Study，并用明亮克制的视觉系统统一体验。",
    result: "访问者可以从技术、产品、设计、AI 工作流或合作意向进入，沿着内容关系理解真实能力。"
  },
  "machi-ios-native-city-life-app": {
    excerpt: "一个 SwiftUI + SwiftData 的离线优先城市生活客户端，覆盖信息流、发布、互动、私信、通知、城市频道和会员能力。",
    challenge: "城市生活社区需要在复杂互动、弱网离线、本地草稿、账号同步和双端一致性之间保持稳定体验。",
    solution: "我用 SwiftData 构建本地持久层，用 MVVM + Repository + Service 管理状态，用 Keychain 保存凭据，并通过 RemoteSyncService 与统一后端对齐。",
    result: "App 形成了具备本地韧性、可恢复同步、隐私边界和长期扩展空间的原生客户端基础。"
  },
  "machi-web-unified-python-backend": {
    excerpt: "一个 Next.js Web 客户端 + Python 后端 + SQLite 数据层的本地生活平台，与 iOS 共用账号、内容、互动、私信、通知和会员状态。",
    challenge: "Web 与 iOS 必须共享同一套业务事实，同时还要保留各自平台的交互节奏和展示密度。",
    solution: "我用 Python 服务承载统一 REST API 与 SSE，用 SQLite 保持数据真相源，用 Next.js 构建 Web 客户端，并补齐序列化兼容字段。",
    result: "系统拥有 80+ REST 端点、SSE 实时能力、19 张数据表、soft delete、cursor 分页、媒体上传和支付状态同步。"
  }
};

const articleUpdates = {
  "ai-native-product-workflows": {
    excerpt: "AI 真正有价值的地方，不是作为一个新鲜按钮，而是被设计进研究、拆解、实现、检查和复盘的稳定工作流。"
  },
  "calm-interfaces-under-pressure": {
    excerpt: "运营型界面需要信息密度、清晰层级、克制表达和可靠反馈，高压场景下的高级感来自冷静。"
  },
  "execution-notes-full-stack-cms": {
    excerpt: "一个内容系统既要前台有表达力，也要后台足够稳定、清晰、可恢复，真正重要的是长期维护体验。"
  },
  "fluid-gradient-personal-site-principles": {
    excerpt: "明亮、梦幻和专业并不冲突，关键是让颜色、动效、玻璃层次和内容结构共同服务品牌记忆。"
  },
  "ai-to-product-prototype-workflow": {
    excerpt: "我如何把一句模糊想法变成用户路径、数据模型、界面原型、可运行代码和可复盘的产品判断。"
  },
  "long-term-content-system": {
    excerpt: "内容系统的价值不在更新频率，而在持续积累判断、经验、作品证据和下一次行动速度。"
  },
  "why-i-redesigned-my-personal-website": {
    excerpt: "个人网站不应该只在发布当天好看，它应该持续展示我正在构建什么、如何判断问题，以及哪些作品真正被打磨过。"
  },
  "ai-codes-fast-judgement-is-hard": {
    excerpt: "AI 能加速实现，但项目边界、质量标准、上线风险和长期维护成本，仍然需要人负责判断。"
  }
};

const guideUpdates = {
  "ai-fullstack-development-guide": {
    excerpt: "一套更稳定的 AI 全栈协作流程：先界定目标和边界，再让 AI 展开方案，最后用构建、测试和人工判断验收。"
  },
  "idea-to-product-prototype": {
    excerpt: "从一句模糊想法开始，压缩成目标用户、关键路径、数据模型和可以跑起来的第一版原型。"
  },
  "nextjs-project-structure": {
    excerpt: "我如何组织 Next.js 项目里的路由、数据层、前台组件、后台组件和通用 UI，避免项目长大后失控。"
  },
  "admin-system-design": {
    excerpt: "后台系统不是堆表单，而是让内容维护、状态校验、权限边界、错误恢复和审计记录都更清楚。"
  },
  "premium-web-design-checklist": {
    excerpt: "判断一个网页是否高级，我会看首屏重心、排版节奏、卡片质感、动效克制、移动端阅读和状态反馈。"
  },
  "personal-brand-system": {
    excerpt: "个人品牌网站不只是展示自己，而是把项目、文章、指南、资源和复盘组织成长期信任系统。"
  }
};

async function upsertSetting(key, value) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}

async function main() {
  for (const [key, value] of Object.entries(settings)) {
    await upsertSetting(key, value);
  }

  for (const [slug, data] of Object.entries(projectUpdates)) {
    await prisma.project.update({
      where: { slug },
      data: {
        ...data,
        seoDescription: data.excerpt,
        longDescription: data.excerpt,
        keyChallenges: json([data.challenge]),
        solutions: json([data.solution]),
        measurableResults: json([data.result])
      }
    }).catch(() => null);
  }

  for (const [slug, data] of Object.entries(articleUpdates)) {
    await prisma.article.update({
      where: { slug },
      data: { ...data, seoDescription: data.excerpt }
    }).catch(() => null);
  }

  for (const [slug, data] of Object.entries(guideUpdates)) {
    await prisma.guide.update({
      where: { slug },
      data: { ...data, seoDescription: data.excerpt }
    }).catch(() => null);
  }

  console.log("Public-facing content polish complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
