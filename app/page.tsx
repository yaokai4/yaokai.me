import { UniverseHome } from "@/components/site/UniverseHome";
import { getNowRecords, getPublicArticles } from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locale, articles, nowItems] = await Promise.all([
    getRequestLocale(),
    getPublicArticles(),
    getNowRecords()
  ]);

  return <UniverseHome locale={locale} articles={articles} nowItems={nowItems} />;
}
