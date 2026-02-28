import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  trackEventMock,
  checkAuthRateLimitMock,
  createServerSupabaseClientMock
} = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
  checkAuthRateLimitMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn()
}));

vi.mock("@/lib/analytics/track", () => ({
  trackEvent: trackEventMock
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  checkAuthRateLimit: checkAuthRateLimitMock
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as resetPasswordConfirmPost } from "@/app/api/auth/reset-password/confirm/route";
import { POST as resetPasswordRequestPost } from "@/app/api/auth/reset-password/route";

function createJsonRequest(url: string, body: unknown, headers?: HeadersInit) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

describe("auth route telemetry emission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkAuthRateLimitMock.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0
    });
  });

  it("emits auth_login_succeeded on successful login", async () => {
    createServerSupabaseClientMock.mockReturnValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email_confirmed_at: "2026-02-28T00:00:00.000Z"
            }
          },
          error: null
        })
      }
    });

    const response = await loginPost(
      createJsonRequest("http://localhost:3000/api/auth/login", {
        email: "candidate@example.com",
        password: "securepass123"
      })
    );

    expect(response.status).toBe(200);
    expect(trackEventMock).toHaveBeenCalledWith("auth_login_succeeded", {
      user_id: "user-1",
      method: "password",
      redirect_target: "/archive"
    });
  });

  it("emits auth_login_failed on invalid credential login", async () => {
    createServerSupabaseClientMock.mockReturnValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: null
          },
          error: {
            code: "invalid_credentials",
            message: "Invalid login credentials"
          }
        })
      }
    });

    const response = await loginPost(
      createJsonRequest("http://localhost:3000/api/auth/login", {
        email: "candidate@example.com",
        password: "wrong-password"
      })
    );

    expect(response.status).toBe(401);
    expect(trackEventMock).toHaveBeenCalledWith("auth_login_failed", {
      error_code: "INVALID_CREDENTIALS"
    });
  });

  it("emits auth_rate_limited and auth_login_failed when login cooldown is active", async () => {
    checkAuthRateLimitMock.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 120
    });

    const response = await loginPost(
      createJsonRequest("http://localhost:3000/api/auth/login", {
        email: "candidate@example.com",
        password: "wrong-password"
      })
    );

    expect(response.status).toBe(429);
    expect(trackEventMock).toHaveBeenCalledWith("auth_rate_limited", {
      action: "login",
      retry_after_seconds: 120
    });
    expect(trackEventMock).toHaveBeenCalledWith("auth_login_failed", {
      error_code: "RATE_LIMITED"
    });
  });

  it("emits auth_password_reset_requested on reset link request", async () => {
    createServerSupabaseClientMock.mockReturnValue({
      auth: {
        resetPasswordForEmail: vi.fn().mockResolvedValue({
          data: {},
          error: null
        })
      }
    });

    const response = await resetPasswordRequestPost(
      createJsonRequest("http://localhost:3000/api/auth/reset-password", {
        email: "candidate@example.com"
      })
    );

    expect(response.status).toBe(200);
    expect(trackEventMock).toHaveBeenCalledWith("auth_password_reset_requested", {
      email_domain: "example.com"
    });
  });

  it("emits auth_password_updated when reset password confirmation succeeds", async () => {
    createServerSupabaseClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1"
            }
          },
          error: null
        }),
        updateUser: vi.fn().mockResolvedValue({
          data: {},
          error: null
        })
      }
    });

    const response = await resetPasswordConfirmPost(
      createJsonRequest("http://localhost:3000/api/auth/reset-password/confirm", {
        newPassword: "securepass123",
        confirmPassword: "securepass123"
      })
    );

    expect(response.status).toBe(200);
    expect(trackEventMock).toHaveBeenCalledWith("auth_password_updated", {
      method: "reset_token"
    });
  });
});
