import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { VpsRecordEditor } from "@/components/admin/VpsResourceScreens";
import { canManageAccessProfiles } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { getVpsResourceConfig } from "@/lib/vps-config";
import { canWriteVps } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ section: string }> };

export default async function AdminVpsNewPage({ params }: PageProps) {
  const actor = await requireVpsUser();
  const { section } = await params;
  const config = getVpsResourceConfig(section);
  if (!config || config.readOnly) notFound();
  if (!canWriteVps(actor)) notFound();
  if (section === "access-profiles" && !canManageAccessProfiles(actor)) notFound();

  return (
    <AdminLayout title={`新建${config.singular}`} description={config.description}>
      <div className="mb-5">
        <Link href={`/admin/vps/${section}`} className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          返回列表
        </Link>
      </div>
      <VpsRecordEditor config={config} />
    </AdminLayout>
  );
}
