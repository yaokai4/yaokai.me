import { UniverseHome } from "@/components/site/UniverseHome";
import {
  getNowRecords,
  getPublicArticles,
  getPublicGuides,
  getPublicProjects,
  getSettings
} from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locale, settings, projects, articles, guides, nowItems] = await Promise.all([
    getRequestLocale(),
    getSettings(),
    getPublicProjects(),
    getPublicArticles(),
    getPublicGuides(),
    getNowRecords()
  ]);

  return (
    <UniverseHome
      locale={locale}
      siteName={settings.siteName || "姚凯"}
      avatarUrl={settings.avatarUrl || "/images/avatar-yaokai.svg"}
      projects={projects}
      articles={articles}
      guides={guides}
      nowItems={nowItems}
    />
  );
}
