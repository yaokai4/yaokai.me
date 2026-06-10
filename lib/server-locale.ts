import { cookies, headers } from "next/headers";
import { localeCookieName, normalizeLocale, type Locale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get("x-yaokai-locale");
  if (headerLocale) return normalizeLocale(headerLocale);

  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(localeCookieName)?.value);
}
