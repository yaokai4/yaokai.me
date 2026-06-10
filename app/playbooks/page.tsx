import { redirect } from "next/navigation";
import { withLocalePath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

export default async function PlaybooksAliasPage() {
  const locale = await getRequestLocale();
  redirect(withLocalePath("/playbook", locale));
}
