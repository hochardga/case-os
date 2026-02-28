import { createHmac } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/env";

export type AuthRateLimitAction = "login" | "password_reset" | "verification_resend";

export type AuthRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type CheckAuthRateLimitOptions = {
  action: AuthRateLimitAction;
  subject: string;
  ipAddress?: string | null;
};

type RateLimitStoreMode = "memory" | "database";

type ActionRateLimitConfig = {
  maxAttempts: number;
  windowSeconds: number;
  blockSeconds: number;
};

type RateLimitConfig = {
  mode: RateLimitStoreMode;
  salt: string;
  actionConfig: Record<AuthRateLimitAction, ActionRateLimitConfig>;
};

type MemoryRateLimitRecord = {
  attemptCount: number;
  windowStartedAtMs: number;
  blockedUntilMs: number | null;
};

type DatabaseRateLimitRow = {
  allowed: boolean;
  retry_after_seconds: number;
};

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_BLOCK_SECONDS = 300;
const DEFAULT_SALT = "phase-2-auth-rate-limit";
const DEFAULT_MAX_ATTEMPTS: Record<AuthRateLimitAction, number> = {
  login: 5,
  password_reset: 3,
  verification_resend: 3
};

const memoryRateLimitStore = new Map<string, MemoryRateLimitRecord>();

function parsePositiveInteger(rawValue: string | undefined, fallback: number) {
  const parsed = Number.parseInt(rawValue ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function resolveStoreMode(source: Record<string, string | undefined>): RateLimitStoreMode {
  const configuredMode = source.AUTH_RATE_LIMIT_STORE?.trim().toLowerCase();
  if (configuredMode === "memory") {
    return "memory";
  }

  if (configuredMode === "database" || configuredMode === "db") {
    return "database";
  }

  return source.SUPABASE_SERVICE_ROLE_KEY?.trim() ? "database" : "memory";
}

function getRateLimitConfig(source: Record<string, string | undefined> = process.env): RateLimitConfig {
  const globalWindowSeconds = parsePositiveInteger(
    source.AUTH_RATE_LIMIT_WINDOW_SECONDS,
    DEFAULT_WINDOW_SECONDS
  );
  const globalBlockSeconds = parsePositiveInteger(
    source.AUTH_RATE_LIMIT_BLOCK_SECONDS,
    DEFAULT_BLOCK_SECONDS
  );

  return {
    mode: resolveStoreMode(source),
    salt: source.AUTH_RATE_LIMIT_SALT?.trim() || DEFAULT_SALT,
    actionConfig: {
      login: {
        maxAttempts: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_LOGIN_MAX_ATTEMPTS,
          DEFAULT_MAX_ATTEMPTS.login
        ),
        windowSeconds: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_LOGIN_WINDOW_SECONDS,
          globalWindowSeconds
        ),
        blockSeconds: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_LOGIN_BLOCK_SECONDS,
          globalBlockSeconds
        )
      },
      password_reset: {
        maxAttempts: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_PASSWORD_RESET_MAX_ATTEMPTS,
          DEFAULT_MAX_ATTEMPTS.password_reset
        ),
        windowSeconds: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_PASSWORD_RESET_WINDOW_SECONDS,
          globalWindowSeconds
        ),
        blockSeconds: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_PASSWORD_RESET_BLOCK_SECONDS,
          globalBlockSeconds
        )
      },
      verification_resend: {
        maxAttempts: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_VERIFICATION_RESEND_MAX_ATTEMPTS,
          DEFAULT_MAX_ATTEMPTS.verification_resend
        ),
        windowSeconds: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_VERIFICATION_RESEND_WINDOW_SECONDS,
          globalWindowSeconds
        ),
        blockSeconds: parsePositiveInteger(
          source.AUTH_RATE_LIMIT_VERIFICATION_RESEND_BLOCK_SECONDS,
          globalBlockSeconds
        )
      }
    }
  };
}

function normalizeIpAddress(ipAddress?: string | null) {
  const normalized = ipAddress?.trim();
  return normalized && normalized.length > 0 ? normalized : "unknown-ip";
}

function normalizeSubject(subject: string) {
  return subject.trim().toLowerCase();
}

function secondsUntil(targetMs: number, nowMs: number) {
  return Math.max(0, Math.ceil((targetMs - nowMs) / 1000));
}

export function hashRateLimitSubject(
  action: AuthRateLimitAction,
  subject: string,
  ipAddress?: string | null,
  salt: string = DEFAULT_SALT
) {
  const base = `${action}:${normalizeSubject(subject)}:${normalizeIpAddress(ipAddress)}`;
  return createHmac("sha256", salt).update(base).digest("hex");
}

function checkMemoryRateLimit(
  action: AuthRateLimitAction,
  subjectHash: string,
  config: ActionRateLimitConfig,
  nowMs: number
): AuthRateLimitResult {
  const key = `${action}:${subjectHash}`;
  const current = memoryRateLimitStore.get(key);

  if (!current) {
    memoryRateLimitStore.set(key, {
      attemptCount: 1,
      windowStartedAtMs: nowMs,
      blockedUntilMs: null
    });
    return {
      allowed: true,
      retryAfterSeconds: 0
    };
  }

  if (current.blockedUntilMs && current.blockedUntilMs > nowMs) {
    return {
      allowed: false,
      retryAfterSeconds: secondsUntil(current.blockedUntilMs, nowMs)
    };
  }

  if (current.blockedUntilMs && current.blockedUntilMs <= nowMs) {
    memoryRateLimitStore.set(key, {
      attemptCount: 1,
      windowStartedAtMs: nowMs,
      blockedUntilMs: null
    });
    return {
      allowed: true,
      retryAfterSeconds: 0
    };
  }

  const windowExpiresAtMs = current.windowStartedAtMs + config.windowSeconds * 1000;
  if (nowMs >= windowExpiresAtMs) {
    memoryRateLimitStore.set(key, {
      attemptCount: 1,
      windowStartedAtMs: nowMs,
      blockedUntilMs: null
    });
    return {
      allowed: true,
      retryAfterSeconds: 0
    };
  }

  const nextAttemptCount = current.attemptCount + 1;
  if (nextAttemptCount > config.maxAttempts) {
    const blockedUntilMs = nowMs + config.blockSeconds * 1000;
    memoryRateLimitStore.set(key, {
      ...current,
      attemptCount: nextAttemptCount,
      blockedUntilMs
    });
    return {
      allowed: false,
      retryAfterSeconds: config.blockSeconds
    };
  }

  memoryRateLimitStore.set(key, {
    ...current,
    attemptCount: nextAttemptCount
  });
  return {
    allowed: true,
    retryAfterSeconds: 0
  };
}

function createServiceSupabaseClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for database rate limiting.");
  }

  return createClient(NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function checkDatabaseRateLimit(
  action: AuthRateLimitAction,
  subjectHash: string,
  config: ActionRateLimitConfig,
  now: Date
): Promise<AuthRateLimitResult> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.rpc("check_auth_rate_limit", {
    p_action: action,
    p_subject_hash: subjectHash,
    p_window_seconds: config.windowSeconds,
    p_max_attempts: config.maxAttempts,
    p_block_seconds: config.blockSeconds,
    p_now: now.toISOString()
  });

  if (error) {
    throw error;
  }

  const rows = data as DatabaseRateLimitRow[] | null;
  const firstRow = rows?.[0];

  if (!firstRow) {
    return {
      allowed: true,
      retryAfterSeconds: 0
    };
  }

  return {
    allowed: Boolean(firstRow.allowed),
    retryAfterSeconds: Math.max(0, Number(firstRow.retry_after_seconds ?? 0))
  };
}

export async function checkAuthRateLimit(
  options: CheckAuthRateLimitOptions
): Promise<AuthRateLimitResult> {
  const now = new Date();
  const nowMs = now.getTime();
  const config = getRateLimitConfig();
  const actionConfig = config.actionConfig[options.action];
  const subjectHash = hashRateLimitSubject(
    options.action,
    options.subject,
    options.ipAddress,
    config.salt
  );

  if (config.mode === "database") {
    return checkDatabaseRateLimit(options.action, subjectHash, actionConfig, now);
  }

  return checkMemoryRateLimit(options.action, subjectHash, actionConfig, nowMs);
}

export function resetAuthRateLimitStore() {
  memoryRateLimitStore.clear();
}
