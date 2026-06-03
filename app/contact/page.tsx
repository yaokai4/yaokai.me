import { Mail, MapPin, MessageCircle, Send, Sparkles, Workflow } from "lucide-react";
import Link from "next/link";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getSettings, getSocials } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "联系 - 姚凯",
  description: "联系我，讨论合作、产品想法、工程系统、AI 工作流或内容创作。",
  path: "/contact"
});

const collaborationTypes = [
  ["个人品牌官网", "把作品、文章、方法论和视觉系统做成一个长期可维护的数字产品。"],
  ["AI 工作流", "把研究、产品拆解、开发、内容和复盘串成可持续协作流程。"],
  ["全栈产品原型", "从数据模型、界面、后台到部署，快速构建能运行的第一版。"],
  ["视觉与体验升级", "重做 Hero、导航、卡片、动效、阅读体验和移动端细节。"]
];

export default async function ContactPage() {
  const settings = await getSettings();
  const socials = getSocials(settings);

  return (
    <>
      <PageHeader
        eyebrow="联系"
        title="当一件事同时需要审美、判断和执行力，我们可以聊聊。"
        description="适合讨论个人品牌网站、全栈产品、AI 工作流、内容系统、设计升级，或者一个值得认真打磨的数字体验。"
      />

      <section className="section-container grid gap-8 py-16 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="grid content-start gap-4">
          <article className="premium-glass-card rounded-md p-5">
            <Mail className="h-5 w-5 text-cyan-700" />
            <p className="mt-5 text-sm font-bold text-slate-500">邮箱</p>
            <Link href={`mailto:${settings.email || "hello@example.com"}`} className="mt-1 block text-xl font-black text-slate-950 hover:text-cyan-700">
              {settings.email || "hello@example.com"}
            </Link>
          </article>

          <article className="premium-glass-card rounded-md p-5">
            <MessageCircle className="h-5 w-5 text-cyan-700" />
            <p className="mt-5 text-sm font-bold text-slate-500">社交链接</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map((social) => (
                <Link key={social.href} href={social.href} target="_blank" className="rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm font-bold text-cyan-700 shadow-sm transition hover:bg-white hover:text-slate-950">
                  {social.label}
                </Link>
              ))}
            </div>
          </article>

          <article className="premium-glass-card rounded-md p-5">
            <MapPin className="h-5 w-5 text-cyan-700" />
            <p className="mt-5 text-sm font-bold text-slate-500">协作方式</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              支持远程协作，重视异步沟通、清晰边界、阶段性交付和可验证结果。
            </p>
          </article>

          <article className="gradient-border-card rounded-md p-5">
            <Sparkles className="h-5 w-5 text-cyan-700" />
            <h2 className="mt-5 text-2xl font-black text-slate-950">我适合接什么样的需求？</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              不是简单套模板，也不是只做静态展示。我更适合参与需要结构、审美、实现和长期维护一起考虑的项目。
            </p>
          </article>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            {collaborationTypes.map(([title, description], index) => (
              <article key={title} className="premium-glass-card rounded-md p-5">
                <div className="flex items-center justify-between gap-4">
                  <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                  {index % 2 === 0 ? <Workflow className="h-4 w-4 text-cyan-700" /> : <Send className="h-4 w-4 text-cyan-700" />}
                </div>
                <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
