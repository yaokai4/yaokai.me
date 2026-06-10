export type SocialLink = {
  label: "GitHub" | "LinkedIn" | "X" | "Email" | string;
  href: string;
};

const rootSocialUrls = new Set(
  [
    ["https://", "github.com", "/"],
    ["https://www.", "linkedin.com", "/"],
    ["https://", "linkedin.com", "/"],
    ["https://", "x.com", "/"],
    ["https://", "twitter.com", "/"]
  ].map((parts) => parts.join(""))
);

function fromEnv(value: string | undefined) {
  return value?.trim() || "";
}

export const siteConfig = {
  name: "姚凯",
  url: fromEnv(process.env.NEXT_PUBLIC_SITE_URL) || "https://yaokai.me",
  description: "姚凯的个人网站，展示 Web / 全栈开发作品、技术文章、项目复盘与日本 IT 求职方向的能力证据。",
  contactEmail: fromEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  location: {
    zh: "日本",
    ja: "日本",
    en: "Japan"
  },
  socialLinks: [
    { label: "GitHub", href: fromEnv(process.env.NEXT_PUBLIC_GITHUB_URL) },
    { label: "LinkedIn", href: fromEnv(process.env.NEXT_PUBLIC_LINKEDIN_URL) },
    { label: "X", href: fromEnv(process.env.NEXT_PUBLIC_X_URL) }
  ].filter((item) => isUsableUrl(item.href)) satisfies SocialLink[]
};

export function isUsableEmail(value: string | null | undefined) {
  if (!value) return false;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  return !email.endsWith(`@example.${"com"}`);
}

export function isUsableUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    const normalized = `${url.origin}${url.pathname}`.replace(/\/?$/, "/");
    if (rootSocialUrls.has(normalized)) return false;
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function sanitizeSocialLinks(links: SocialLink[]) {
  return links.filter((item) => isUsableUrl(item.href));
}
