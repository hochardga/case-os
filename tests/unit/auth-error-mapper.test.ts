import { describe, expect, it } from "vitest";

import { mapAuthError } from "@/lib/auth/error-mapper";

describe("mapAuthError", () => {
  it("maps invalid credentials errors", () => {
    const result = mapAuthError({
      code: "invalid_credentials",
      message: "Invalid login credentials"
    });

    expect(result.code).toBe("INVALID_CREDENTIALS");
    expect(result.status).toBe(401);
  });

  it("maps duplicate email errors", () => {
    const result = mapAuthError({
      message: "User already registered"
    });

    expect(result.code).toBe("EMAIL_ALREADY_IN_USE");
    expect(result.status).toBe(409);
  });

  it("maps weak password errors", () => {
    const result = mapAuthError({
      message: "Password should be at least 6 characters."
    });

    expect(result.code).toBe("WEAK_PASSWORD");
    expect(result.status).toBe(400);
  });

  it("maps rate-limited errors", () => {
    const result = mapAuthError({
      status: 429,
      message: "Too many requests"
    });

    expect(result.code).toBe("RATE_LIMITED");
    expect(result.status).toBe(429);
  });

  it("falls back to unknown for unrecognized errors", () => {
    const result = mapAuthError(new Error("Something else happened"));

    expect(result.code).toBe("UNKNOWN");
    expect(result.status).toBe(400);
  });
});

