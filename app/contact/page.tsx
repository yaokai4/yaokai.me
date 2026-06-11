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
  const titles = {
    zh: "联系 - 姚凯",
    ja: "お問い合わせ - 姚凱",
    en: "Contact - Yaokai"
  } as const;
  const descriptions = {
    zh: "联系姚凯，讨论职位机会、项目合作、Machi、Shangence 商衡或网站相关问题。",
    ja: "姚凱へのお問い合わせ。求人、協業、Machi、Shangence 商衡、このサイトについて。",
    en: "Contact Yaokai about roles, collaboration, Machi, Shangence, or this website."
  } as const;

  return createMetadata({
    title: titles[locale],
    description: descriptions[locale],
    path: "/contact",
    locale
  });
}

const pageCopy = {
  zh: {
    eyebrow: "联系",
    title: "找我聊职位、合作，或者直接问项目细节都可以。",
    description: "我现在主要关注日本的 Web / 全栈开发机会，也欢迎围绕 Machi、Shangence 商衡、个人网站、App 上架和产品实现聊一聊。",
    email: "邮箱",
    emailMissing: "也可以直接使用右侧表单，我会尽快回复。",
    socials: "社交链接",
    socialsMissing: "GitHub 和邮箱是最稳定的入口。",
    collaboration: "现在的方向",
    collaborationBody: "希望参与 Web 应用、全栈开发、自社服务、前端、iOS / Android 相关工作。远程或线下都可以具体聊。",
    fitTitle: "可以聊什么",
    fitBody: "职位机会、项目合作、代码仓库、作品集、简历、Machi / Shangence 的实现细节，或者这个网站本身。",
    collaborationTypes: [
      ["职位机会", "Web 应用、前端、全栈、自社服务、移动端都可以聊。"],
      ["产品实现", "从需求、UI、API、数据库、支付、后台到部署，我都能说明自己做过的部分。"],
      ["Machi / Shangence", "两个产品的技术结构、业务判断、上架准备和后续计划。"],
      ["个人网站", "如果你想看代码、后台、部署或三语切换实现，也可以直接问。"]
    ]
  },
  ja: {
    eyebrow: "連絡",
    title: "求人、協業、プロジェクトの詳細など、お気軽にご連絡ください。",
    description: "現在は日本での Web / フルスタック開発の機会を中心に探しています。Machi、Shangence 商衡、個人サイト、アプリ公開準備についても話せます。",
    email: "メール",
    emailMissing: "右側のフォームからご連絡ください。できるだけ早く返信します。",
    socials: "ソーシャルリンク",
    socialsMissing: "GitHub とメールが一番確実です。",
    collaboration: "探している方向",
    collaborationBody: "Webアプリ、フルスタック、自社サービス、フロントエンド、iOS / Android 関連の仕事に関心があります。リモート・対面どちらも相談できます。",
    fitTitle: "相談できること",
    fitBody: "求人、協業、コード、制作実績、職務経歴、Machi / Shangence の実装、このサイトについて。",
    collaborationTypes: [
      ["求人", "Webアプリ、フロントエンド、フルスタック、自社サービス、モバイル関連。"],
      ["プロダクト実装", "要件、UI、API、DB、決済、管理画面、デプロイまで説明できます。"],
      ["Machi / Shangence", "技術構成、事業判断、アプリ公開準備、今後の計画。"],
      ["個人サイト", "コード、管理画面、デプロイ、3言語切替の実装について。"]
    ]
  },
  en: {
    eyebrow: "Contact",
    title: "Reach out about roles, collaboration, or details behind the projects.",
    description: "I am looking mainly at Web / full-stack opportunities in Japan, and I am happy to talk about Machi, Shangence, this site, app release prep, or product implementation.",
    email: "Email",
    emailMissing: "Please use the form and I will reply as soon as possible.",
    socials: "Social Links",
    socialsMissing: "GitHub and email are the most reliable routes.",
    collaboration: "Current direction",
    collaborationBody: "I am interested in Web apps, full-stack roles, in-house products, frontend, and iOS / Android adjacent work. Remote or in-person can both work.",
    fitTitle: "Good things to discuss",
    fitBody: "Roles, collaboration, source code, portfolio details, resume, Machi / Shangence implementation, or this site itself.",
    collaborationTypes: [
      ["Roles", "Web app, frontend, full-stack, in-house product, and mobile-adjacent work."],
      ["Product implementation", "Requirements, UI, API, database, payments, admin tools, and deployment."],
      ["Machi / Shangence", "Architecture, product decisions, release prep, and next steps."],
      ["This site", "Code, CMS, deployment, and the three-language implementation."]
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
