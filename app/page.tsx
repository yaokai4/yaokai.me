import { UniverseHome } from "@/components/site/UniverseHome";
import {
  getManifestoItems,
  getNowRecords,
  getPlaybooks,
  getPublicArticles,
  getPublicGuides,
  getPublicProjects,
  getResources,
  getSettings,
  getSkills
} from "@/lib/data";
import { getRequestLocale } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locale, settings, projects, articles, guides, resources, playbooks, nowItems, manifestoItems, skills] = await Promise.all([
    getRequestLocale(),
    getSettings(),
    getPublicProjects(),
    getPublicArticles(),
    getPublicGuides(),
    getResources(),
    getPlaybooks(),
    getNowRecords(),
    getManifestoItems(),
    getSkills()
  ]);

  return (
    <UniverseHome
      locale={locale}
      siteName={settings.siteName || "姚凯"}
      avatarUrl={settings.avatarUrl || "/images/avatar-yaokai.svg"}
      projects={projects}
      articles={articles}
      guides={guides}
      resources={resources}
      playbooks={playbooks}
      nowItems={nowItems}
      manifestoItems={manifestoItems}
      skills={skills}
    />
  );
}
