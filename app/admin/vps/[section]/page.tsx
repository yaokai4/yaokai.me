import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { VpsSectionManager } from "@/components/admin/VpsResourceScreens";
import { requireVpsUser } from "@/lib/auth";
import { canManageAccessProfiles } from "@/lib/access-profiles";
import { prisma } from "@/lib/prisma";
import { getVpsResourceConfig } from "@/lib/vps-config";
import { canReadVpsResource, listVpsRecords } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ section: string }> };

export default async function AdminVpsSectionPage({ params }: PageProps) {
  const actor = await requireVpsUser();
  const { section } = await params;
  const config = getVpsResourceConfig(section);
  if (!config) notFound();
  if (section !== "access-profiles" && !canReadVpsResource(actor, section)) notFound();
  const items = section === "access-profiles"
    ? await listAccessProfilesForActor(actor)
    : await listVpsRecords(section) as Array<Record<string, unknown> & { id: string }>;
  const canCreate = !config.readOnly && (section !== "access-profiles" || canManageAccessProfiles(actor));

  return (
    <AdminLayout title={config.title} description={config.description}>
      <div className="mb-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <Link href="/admin/vps" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          返回总览
        </Link>
        {canCreate ? (
          <Link href={`/admin/vps/${section}/new`} className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            新建{config.singular}
          </Link>
        ) : null}
      </div>
      <VpsSectionManager config={config} items={items} />
    </AdminLayout>
  );
}

async function listAccessProfilesForActor(actor: { id: string; email: string; role: string }) {
  const ownUser = await prisma.vpsUser.findUnique({ where: { email: actor.email }, select: { id: true } });
  const profiles = await prisma.vpsAccessProfile.findMany({
    where: canManageAccessProfiles(actor) || ["AUDITOR", "auditor"].includes(actor.role) ? {} : ownUser ? { userId: ownUser.id } : { id: "__none__" },
    orderBy: { updatedAt: "desc" },
    take: 300
  });
  return profiles.map((profile) => {
    const safe = { ...profile } as Record<string, unknown> & { id: string };
    delete safe.encryptedConfig;
    delete safe.encryptedPrivateKey;
    return safe;
  }) as Array<Record<string, unknown> & { id: string }>;
}
