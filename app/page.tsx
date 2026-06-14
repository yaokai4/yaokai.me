import { UniverseHome } from "@/components/site/UniverseHome";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { getPublicArticles } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locale, articles, copyOverrides] = await Promise.all([
    getRequestLocale(),
    getPublicArticles(),
    getCopyOverrides()
  ]);

  return <UniverseHome locale={locale} articles={articles} copyOverrides={copyOverrides} />;
}
