import { prisma } from "@/lib/prisma";
import { writeVpsAuditLog, type AdminActor } from "@/lib/vps-data";

const timeoutMs = 5000;

function statusFromCheck(ok: boolean, responseTimeMs?: number) {
  if (!ok) return "major_outage";
  if (typeof responseTimeMs === "number" && responseTimeMs > 3000) return "degraded";
  return "operational";
}

function certificateLevel(expiresAt: Date | null) {
  if (!expiresAt) return null;
  const days = (expiresAt.getTime() - Date.now()) / 86_400_000;
  if (days <= 7) return "critical";
  if (days <= 14) return "warning";
  return null;
}

async function ensureOpenAlert(data: {
  title: string;
  level: string;
  source: string;
  condition: string;
  serviceId?: string | null;
  nodeId?: string | null;
  accessProfileId?: string | null;
}) {
  const existing = await prisma.vpsAlert.findFirst({
    where: {
      status: { in: ["open", "acknowledged"] },
      source: data.source,
      serviceId: data.serviceId || undefined,
      nodeId: data.nodeId || undefined,
      accessProfileId: data.accessProfileId || undefined,
      title: data.title
    }
  });
  if (existing) return existing;
  return prisma.vpsAlert.create({ data });
}

async function resolveAlerts(serviceId: string, source: string) {
  await prisma.vpsAlert.updateMany({
    where: { serviceId, source, status: { in: ["open", "acknowledged"] } },
    data: { status: "resolved", resolvedAt: new Date() }
  });
}

async function checkHttpService(service: {
  id: string;
  name: string;
  healthCheckUrl: string | null;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}) {
  if (!service.healthCheckUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  let statusCode: number | undefined;
  let errorMessage: string | undefined;
  let ok = false;

  try {
    const response = await fetch(service.healthCheckUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });
    statusCode = response.status;
    ok = response.status >= 200 && response.status < 400;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "health check failed";
  } finally {
    clearTimeout(timer);
  }

  const responseTimeMs = Date.now() - startedAt;
  const nextFailures = ok ? 0 : service.consecutiveFailures + 1;
  const nextSuccesses = ok ? service.consecutiveSuccesses + 1 : 0;
  const derivedStatus = statusFromCheck(ok, responseTimeMs);
  const serviceStatus = !ok && nextFailures >= 3 ? "major_outage" : ok && nextSuccesses >= 2 ? "operational" : derivedStatus;

  await prisma.vpsHealthCheck.create({
    data: {
      serviceId: service.id,
      url: service.healthCheckUrl,
      statusCode,
      responseTimeMs,
      result: ok ? "success" : "failed",
      errorMessage
    }
  });

  await prisma.vpsService.update({
    where: { id: service.id },
    data: {
      publicStatus: serviceStatus,
      internalStatus: serviceStatus,
      responseTimeMs,
      lastCheckedAt: new Date(),
      consecutiveFailures: nextFailures,
      consecutiveSuccesses: nextSuccesses
    }
  });

  if (!ok && nextFailures >= 3) {
    await ensureOpenAlert({
      title: `服务离线：${service.name}`,
      level: "critical",
      source: "health_check",
      serviceId: service.id,
      condition: `HTTP 连续失败 ${nextFailures} 次。`
    });
  } else if (ok && nextSuccesses >= 2) {
    await resolveAlerts(service.id, "health_check");
  } else if (ok && responseTimeMs > 3000) {
    await ensureOpenAlert({
      title: `响应时间过高：${service.name}`,
      level: "warning",
      source: "health_check",
      serviceId: service.id,
      condition: `最近响应时间 ${responseTimeMs}ms，超过 3000ms。`
    });
  }

  return { serviceId: service.id, ok, statusCode, responseTimeMs, serviceStatus };
}

async function checkCertificate(service: { id: string; name: string; certificateExp: Date | null }) {
  const level = certificateLevel(service.certificateExp);
  if (!level || !service.certificateExp) return null;
  await ensureOpenAlert({
    title: `证书即将过期：${service.name}`,
    level,
    source: "certificate",
    serviceId: service.id,
    condition: `证书将在 ${service.certificateExp.toISOString().slice(0, 10)} 到期。`
  });
  return { serviceId: service.id, level };
}

export async function runVpsHealthChecks(actor?: AdminActor | null, request?: Request) {
  const services = await prisma.vpsService.findMany({
    where: {
      disabledAt: null,
      publicStatus: { not: "disabled" },
      OR: [{ healthCheckUrl: { not: null } }, { certificateExp: { not: null } }]
    },
    select: {
      id: true,
      name: true,
      healthCheckUrl: true,
      consecutiveFailures: true,
      consecutiveSuccesses: true,
      certificateExp: true
    }
  });

  const httpResults = [];
  const certificateResults = [];

  for (const service of services) {
    const httpResult = await checkHttpService(service);
    if (httpResult) httpResults.push(httpResult);
    const certificateResult = await checkCertificate(service);
    if (certificateResult) certificateResults.push(certificateResult);
  }

  await writeVpsAuditLog({
    request,
    actor,
    action: "health_check_run",
    targetType: "vps_health_check",
    after: { checkedServices: services.length, httpResults, certificateResults }
  });

  const accessProfileResults = await checkAccessProfiles();

  return {
    checkedServices: services.length,
    httpResults,
    certificateResults,
    accessProfileResults
  };
}

async function checkAccessProfiles() {
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 86_400_000);
  const inOneDay = new Date(now.getTime() + 86_400_000);

  const expired = await prisma.vpsAccessProfile.updateMany({
    where: { status: { in: ["active", "paused"] }, expiresAt: { lte: now } },
    data: { status: "expired" }
  });

  const expiring = await prisma.vpsAccessProfile.findMany({
    where: {
      status: "active",
      expiresAt: { gt: now, lte: inSevenDays }
    },
    select: { id: true, name: true, expiresAt: true }
  });

  for (const profile of expiring) {
    const level = profile.expiresAt <= inOneDay ? "critical" : "warning";
    await ensureOpenAlert({
      title: `访问配置即将过期：${profile.name}`,
      level,
      source: "access_profile_expiry",
      accessProfileId: profile.id,
      condition: `访问配置将在 ${profile.expiresAt.toISOString().slice(0, 10)} 过期。`
    });
  }

  if (expired.count) {
    await writeVpsAuditLog({
      action: "access_profile_expired",
      targetType: "access_profile",
      after: { expiredCount: expired.count }
    });
  }

  return {
    expiredCount: expired.count,
    expiringCount: expiring.length
  };
}
