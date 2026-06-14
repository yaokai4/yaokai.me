import "server-only";

import { SITE_COPY_SETTING_KEY, parseCopyOverrides, type CopyOverrides } from "@/lib/copy-overrides";
import { prisma } from "@/lib/prisma";

export async function getCopyOverrides(): Promise<CopyOverrides> {
  const row = await prisma.siteSetting.findUnique({ where: { key: SITE_COPY_SETTING_KEY } });
  return parseCopyOverrides(row?.value);
}

export async function saveCopyOverrides(overrides: CopyOverrides) {
  const value = JSON.stringify(overrides, null, 2);
  await prisma.siteSetting.upsert({
    where: { key: SITE_COPY_SETTING_KEY },
    update: { value, description: "后台维护的全站静态文案覆盖值" },
    create: {
      key: SITE_COPY_SETTING_KEY,
      value,
      description: "后台维护的全站静态文案覆盖值"
    }
  });
}
