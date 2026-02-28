const INTERNAL_APP_ORIGIN = "https://ashfall.local";
const DEFAULT_NEXT_PATH = "/archive";

function canParsePath(value: string) {
  try {
    const parsed = new URL(value, INTERNAL_APP_ORIGIN);
    return parsed.origin === INTERNAL_APP_ORIGIN;
  } catch {
    return false;
  }
}

export function isSafeRelativePath(value: string) {
  if (!value.startsWith("/")) {
    return false;
  }

  if (value.startsWith("//")) {
    return false;
  }

  if (value.includes("\u0000")) {
    return false;
  }

  return canParsePath(value);
}

export function sanitizeNextPath(next: unknown, fallback = DEFAULT_NEXT_PATH) {
  if (typeof next !== "string") {
    return fallback;
  }

  const trimmed = next.trim();
  if (trimmed.length === 0) {
    return fallback;
  }

  return isSafeRelativePath(trimmed) ? trimmed : fallback;
}

export function buildLoginRedirect(next: unknown, fallback = DEFAULT_NEXT_PATH) {
  const safeNext = sanitizeNextPath(next, fallback);
  return `/login?next=${encodeURIComponent(safeNext)}`;
}
