import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { withLocalePath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";

export default async function NotFound() {
  const locale = await getRequestLocale();

  return (
    <section className="section-container grid min-h-screen place-items-center py-24">
      <div className="max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-700">404</p>
        <h1 className="mt-5 text-balance text-5xl font-semibold text-slate-950 md:text-7xl">这个页面暂时不在轨道上。</h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          你要找的内容可能已经移动、暂时不可用，或者还在内容系统中等待创建。
        </p>
        <Link href={withLocalePath("/", locale)} className="mt-8 inline-flex">
          <Button>返回首页</Button>
        </Link>
      </div>
    </section>
  );
}
