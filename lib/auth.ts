import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE = "personal_website_session";
export const ADMIN_ENTRY_COOKIE = "personal_website_admin_entry";

export function shouldUseSecureCookie() {
  const override = process.env.AUTH_COOKIE_SECURE;
  if (override) return override !== "false" && override !== "0";

  const publicUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VPS_APP_URL;
  if (publicUrl) {
    try {
      return new URL(publicUrl).protocol === "https:";
    } catch {
      return publicUrl.startsWith("https://");
    }
  }

  return process.env.NODE_ENV === "production";
}

function getSecret() {
  const secret = process.env.VPS_AUTH_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET || "please-change-this-secret";
  return new TextEncoder().encode(secret);
}

export async function createSession(user: { id: string; email: string; role: string }) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return token;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  cookieStore.delete(ADMIN_ENTRY_COOKIE);
}

export async function verifyToken(token?: string | null) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || !payload.email) return null;

    return {
      id: String(payload.sub),
      email: String(payload.email),
      role: String(payload.role || "ADMIN")
    };
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const session = await verifyToken(token);
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireVpsUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function authenticate(account: string, password: string) {
  const normalizedAccount = account.trim();
  const aliases = (process.env.ADMIN_LOGIN_ALIASES || "yaokai")
    .split(",")
    .map((alias) => alias.trim().toLowerCase())
    .filter(Boolean);
  const accountCandidates = [normalizedAccount];
  if (!normalizedAccount.includes("@") && aliases.includes(normalizedAccount.toLowerCase())) {
    accountCandidates.push(process.env.ADMIN_EMAIL || "admin@yaokai.me");
  }

  let user = null;
  for (const candidate of [...new Set(accountCandidates)]) {
    user = await prisma.user.findUnique({ where: { email: candidate } });
    if (user) break;
  }
  if (!user) return null;

  let valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid && user.email === (process.env.ADMIN_EMAIL || "admin@yaokai.me")) {
    const fallbackPasswords = (process.env.ADMIN_PASSWORD_ALIASES || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (fallbackPasswords.includes(password)) {
      valid = true;
    }
  }
  if (!valid && user.email === (process.env.ADMIN_EMAIL || "admin@yaokai.me")) {
    const fallbackHashes = (process.env.ADMIN_PASSWORD_HASH_ALIASES || "")
      .split(",")
      .map((hash) => hash.trim())
      .filter(Boolean);
    for (const hash of fallbackHashes) {
      if (await bcrypt.compare(password, hash)) {
        valid = true;
        break;
      }
    }
  }
  if (!valid) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCnt: { increment: 1 } }
    });
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCnt: 0, lastLoginAt: new Date() }
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
