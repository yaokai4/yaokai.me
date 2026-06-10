import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [services, activeAlerts] = await Promise.all([
    prisma.vpsService.findMany({
      where: { publicStatus: { not: "disabled" }, disabledAt: null },
      orderBy: [{ publicStatus: "asc" }, { name: "asc" }],
      select: {
        name: true,
        type: true,
        publicStatus: true,
        lastCheckedAt: true,
        responseTimeMs: true
      },
      take: 100
    }),
    prisma.vpsAlert.findMany({
      where: { status: { in: ["open", "acknowledged"] } },
      select: {
        title: true,
        level: true,
        status: true,
        triggeredAt: true
      },
      orderBy: { triggeredAt: "desc" },
      take: 20
    })
  ]);

  const overall = services.some((service) => service.publicStatus === "major_outage")
    ? "major_outage"
    : services.some((service) => service.publicStatus === "degraded" || service.publicStatus === "partial_outage")
      ? "degraded"
      : "operational";

  return NextResponse.json({
    overall,
    updatedAt: new Date().toISOString(),
    services,
    activeAlerts
  });
}
