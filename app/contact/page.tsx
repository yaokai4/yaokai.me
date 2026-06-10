import { Mail, MapPin, MessageCircle, Send, Sparkles, Workflow } from "lucide-react";
import Link from "next/link";
import { isUsableEmail, siteConfig } from "@/config/site.config";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getRequestLocale } from "@/lib/server-locale";
import { contactPageJsonLd, createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();

  return createMetadata({
    title: "联系 - 姚凯",
    description: "联系我，讨论合作、产品想法、工程系统、AI 工作流或内容创作。",
    path: "/contact",
    locale
  });
}

const pageCopy = {
  zh: {
    eyebrow: "联系",
    title: "如果一个项目需要审美、判断和执行力同时在线，我们可以认真聊一次。",
    description: "适合个人品牌网站、全栈产品原型、AI 工作流、内容系统、设计升级，或任何值得从结构到上线都认真打磨的数字体验。",
    email: "邮箱",
    emailMissing: "请直接使用右侧表单，我会尽快回复。",
    socials: "社交链接",
    socialsMissing: "当前优先使用联系表单沟通。",
    collaboration: "协作方式",
    collaborationBody: "支持远程协作，重视异步沟通、清晰边界、阶段性交付、真实验收和可维护结果。",
    fitTitle: "我适合什么样的需求？",
    fitBody: "不是简单套模板，也不是只做静态展示。我更适合参与需要产品结构、界面质感、全栈实现和长期维护一起考虑的项目。",
    collaborationTypes: [
      ["个人品牌系统", "把作品、文章、方法论、资源库和视觉系统做成一个长期可维护、可持续积累信任的数字产品。"],
      ["AI 工作流", "把研究、产品拆解、开发、内容生产和复盘串成可执行、可验证、可复用的协作流程。"],
      ["全栈产品原型", "从数据模型、界面、后台、权限到部署，构建能真实运行、后续可扩展的第一版系统。"],
      ["高级视觉升级", "重构 Hero、导航、卡片、动效、阅读体验、移动端和状态反馈，让网站从普通变成精致。"]
    ]
  },
  ja: {
    eyebrow: "連絡",
    title: "見た目、判断、実装力が同時に必要なプロジェクトなら、一度整理して話しましょう。",
    description: "個人ブランドサイト、フルスタック試作、AI ワークフロー、コンテンツシステム、UI 改善に向いています。",
    email: "メール",
    emailMissing: "右側のフォームからご連絡ください。できるだけ早く返信します。",
    socials: "ソーシャルリンク",
    socialsMissing: "まずはフォームでの連絡を優先しています。",
    collaboration: "協業スタイル",
    collaborationBody: "リモート対応、非同期コミュニケーション、明確な範囲設定、段階的な納品、検証可能な結果を重視します。",
    fitTitle: "どのような相談に向いているか",
    fitBody: "単なるテンプレート適用ではなく、構造、見た目、実装、長期運用を一緒に考えるプロジェクトに向いています。",
    collaborationTypes: [
      ["個人ブランドシステム", "制作実績、記事、方法論、リソース、視覚システムを長く運用できるデジタルプロダクトにします。"],
      ["AI ワークフロー", "調査、プロダクト分解、開発、コンテンツ、振り返りを検証可能な協業フローにします。"],
      ["フルスタック試作", "データモデル、UI、管理画面、権限、デプロイまで、実際に動く第一版を作ります。"],
      ["上質な UI 改善", "Hero、ナビ、カード、動き、読書体験、モバイル、状態表現を整えます。"]
    ]
  },
  en: {
    eyebrow: "Contact",
    title: "If a project needs taste, judgment, and execution at the same time, we can have a focused conversation.",
    description: "Good fit for personal brand sites, full-stack prototypes, AI workflows, content systems, UI upgrades, and digital products worth polishing from structure to launch.",
    email: "Email",
    emailMissing: "Please use the form and I will reply as soon as possible.",
    socials: "Social Links",
    socialsMissing: "The contact form is the best place to start right now.",
    collaboration: "Collaboration",
    collaborationBody: "Remote-friendly, async by default, with clear scope, staged delivery, real validation, and maintainable outcomes.",
    fitTitle: "What kind of work fits me?",
    fitBody: "I am not just applying templates or building static pages. I fit work that needs product structure, interface quality, full-stack implementation, and long-term maintainability.",
    collaborationTypes: [
      ["Personal brand system", "Turning work, writing, methods, resources, and visual identity into a long-term digital product that can build trust."],
      ["AI workflow", "Connecting research, product framing, development, content, and retrospectives into a reusable, verifiable workflow."],
      ["Full-stack prototype", "Building a real first version from data model, interface, admin tools, permissions, and deployment."],
      ["Premium UI upgrade", "Refining hero, navigation, cards, motion, reading experience, mobile details, and interface states."]
    ]
  }
} as const;

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const t = pageCopy[locale];
  const email = isUsableEmail(siteConfig.contactEmail) ? siteConfig.contactEmail : "";
  const socials = siteConfig.socialLinks;

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <section className="section-container grid gap-8 py-16 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="grid content-start gap-4">
          <article className="premium-glass-card rounded-md p-5">
            <Mail className="h-5 w-5 text-indigo-700" />
            <p className="mt-5 text-sm font-bold text-slate-500">{t.email}</p>
            {email ? (
              <Link href={`mailto:${email}`} className="mt-1 block break-all text-xl font-black text-slate-950 hover:text-indigo-700 focus-ring">
                {email}
              </Link>
            ) : (
              <p className="mt-2 text-sm leading-7 text-slate-600">{t.emailMissing}</p>
            )}
          </article>

          <article className="premium-glass-card rounded-md p-5">
            <MessageCircle className="h-5 w-5 text-indigo-700" />
            <p className="mt-5 text-sm font-bold text-slate-500">{t.socials}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.length ? socials.map((social) => (
                <Link key={social.href} href={social.href} target="_blank" className="rounded-md border border-indigo-200/70 bg-white px-3 py-2 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-white hover:text-slate-950 focus-ring">
                  {social.label}
                </Link>
              )) : <p className="text-sm leading-7 text-slate-600">{t.socialsMissing}</p>}
            </div>
          </article>

          <article className="premium-glass-card rounded-md p-5">
            <MapPin className="h-5 w-5 text-indigo-700" />
            <p className="mt-5 text-sm font-bold text-slate-500">{t.collaboration}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {t.collaborationBody}
            </p>
          </article>

          <article className="gradient-border-card rounded-md p-5">
            <Sparkles className="h-5 w-5 text-indigo-700" />
            <h2 className="mt-5 text-2xl font-black text-slate-950">{t.fitTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t.fitBody}
            </p>
          </article>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            {t.collaborationTypes.map(([title, description], index) => (
              <article key={title} className="premium-glass-card rounded-md p-5">
                <div className="flex items-center justify-between gap-4">
                  <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                  {index % 2 === 0 ? <Workflow className="h-4 w-4 text-indigo-700" /> : <Send className="h-4 w-4 text-indigo-700" />}
                </div>
                <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
          <ContactForm />
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd("/contact")) }}
      />
    </>
  );
}
