export type CopyOverrides = Record<string, string>;

export const SITE_COPY_SETTING_KEY = "siteCopyOverrides";

export function parseCopyOverrides(value: string | null | undefined): CopyOverrides {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string")
    );
  } catch {
    return {};
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function applyCopyOverrides<T>(value: T, overrides: CopyOverrides, path: string): T {
  if (typeof value === "string") {
    return (overrides[path] ?? value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => applyCopyOverrides(item, overrides, `${path}.${index}`)) as T;
  }

  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = typeof item === "function" ? item : applyCopyOverrides(item, overrides, `${path}.${key}`);
    }
    return next as T;
  }

  return value;
}

export function flattenCopyValues(value: unknown, path: string, output: CopyOverrides = {}): CopyOverrides {
  if (typeof value === "string") {
    output[path] = value;
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenCopyValues(item, `${path}.${index}`, output));
    return output;
  }

  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (typeof item !== "function") flattenCopyValues(item, `${path}.${key}`, output);
    }
  }

  return output;
}
