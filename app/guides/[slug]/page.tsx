import { redirect } from "next/navigation";
import { withLocalePath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export default async function GuideDetailAliasPage({ params }: PageProps) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  redirect(withLocalePath(`/guide/${slug}`, locale));
}
