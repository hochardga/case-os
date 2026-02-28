import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkAuthRateLimit,
  hashRateLimitSubject,
  resetAuthRateLimitStore
} from "@/lib/auth/rate-limit";

describe("auth rate limit", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-28T00:00:00.000Z"));
    process.env = {
      ...originalEnv,
      AUTH_RATE_LIMIT_STORE: "memory",
      AUTH_RATE_LIMIT_SALT: "test-rate-limit-salt",
      AUTH_RATE_LIMIT_LOGIN_MAX_ATTEMPTS: "2",
      AUTH_RATE_LIMIT_LOGIN_WINDOW_SECONDS: "60",
      AUTH_RATE_LIMIT_LOGIN_BLOCK_SECONDS: "120"
    };
    resetAuthRateLimitStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetAuthRateLimitStore();
    process.env = { ...originalEnv };
  });

  it("hashes subject deterministically with normalized identifiers", () => {
    const firstHash = hashRateLimitSubject(
      "login",
      " Candidate@Example.com ",
      "203.0.113.5",
      "fixed-salt"
    );
    const secondHash = hashRateLimitSubject(
      "login",
      "candidate@example.com",
      "203.0.113.5",
      "fixed-salt"
    );
    const differentHash = hashRateLimitSubject(
      "login",
      "candidate@example.com",
      "203.0.113.8",
      "fixed-salt"
    );

    expect(firstHash).toBe(secondHash);
    expect(differentHash).not.toBe(firstHash);
    expect(firstHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("enforces cooldown after threshold and returns deterministic retry seconds", async () => {
    const firstAttempt = await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.1"
    });
    const secondAttempt = await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.1"
    });
    const blockedAttempt = await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.1"
    });

    expect(firstAttempt).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(secondAttempt).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(blockedAttempt).toEqual({ allowed: false, retryAfterSeconds: 120 });

    vi.advanceTimersByTime(30_000);
    const blockedDuringCooldown = await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.1"
    });
    expect(blockedDuringCooldown).toEqual({ allowed: false, retryAfterSeconds: 90 });

    vi.advanceTimersByTime(90_000);
    const afterCooldown = await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.1"
    });
    expect(afterCooldown).toEqual({ allowed: true, retryAfterSeconds: 0 });
  });

  it("resets the attempt window after configured expiry", async () => {
    process.env.AUTH_RATE_LIMIT_LOGIN_WINDOW_SECONDS = "5";
    process.env.AUTH_RATE_LIMIT_LOGIN_BLOCK_SECONDS = "60";

    await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.2"
    });
    await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.2"
    });

    vi.advanceTimersByTime(6_000);
    const firstAttemptAfterWindow = await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.2"
    });
    const secondAttemptAfterWindow = await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.2"
    });
    const blockedAttemptAfterWindow = await checkAuthRateLimit({
      action: "login",
      subject: "candidate@example.com",
      ipAddress: "198.51.100.2"
    });

    expect(firstAttemptAfterWindow).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(secondAttemptAfterWindow).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(blockedAttemptAfterWindow).toEqual({
      allowed: false,
      retryAfterSeconds: 60
    });
  });
});
