import { describe, expect, it } from "vitest";

import {
  accountDeletionRequestSchema,
  applySchema,
  loginSchema,
  resendVerificationSchema,
  resetPasswordConfirmSchema,
  resetPasswordSchema
} from "@/lib/validation/auth";

describe("auth validation schemas", () => {
  it("accepts valid apply payloads and normalizes email", () => {
    const result = applySchema.safeParse({
      email: "USER@Example.com",
      password: "securepass123",
      callsign: "Ash_01"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
      expect(result.data.callsign).toBe("Ash_01");
    }
  });

  it("rejects apply payloads with invalid callsign", () => {
    const result = applySchema.safeParse({
      email: "user@example.com",
      password: "securepass123",
      callsign: "bad callsign"
    });

    expect(result.success).toBe(false);
  });

  it("rejects login payloads when password is empty", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: ""
    });

    expect(result.success).toBe(false);
  });

  it("accepts login payloads with a safe next path", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "securepass123",
      next: "/archive"
    });

    expect(result.success).toBe(true);
  });

  it("rejects login payloads with an unsafe next path", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "securepass123",
      next: "https://evil.example/phish"
    });

    expect(result.success).toBe(false);
  });

  it("rejects reset payloads with invalid email", () => {
    const result = resetPasswordSchema.safeParse({
      email: "not-an-email"
    });

    expect(result.success).toBe(false);
  });

  it("accepts reset password confirmation payloads with matching passwords", () => {
    const result = resetPasswordConfirmSchema.safeParse({
      newPassword: "securepass123",
      confirmPassword: "securepass123"
    });

    expect(result.success).toBe(true);
  });

  it("rejects reset password confirmation when passwords do not match", () => {
    const result = resetPasswordConfirmSchema.safeParse({
      newPassword: "securepass123",
      confirmPassword: "securepass456"
    });

    expect(result.success).toBe(false);
  });

  it("accepts resend verification payloads with valid email", () => {
    const result = resendVerificationSchema.safeParse({
      email: "user@example.com"
    });

    expect(result.success).toBe(true);
  });

  it("requires DELETE confirmation for account deletion requests", () => {
    const invalidResult = accountDeletionRequestSchema.safeParse({
      confirmationText: "delete"
    });
    const validResult = accountDeletionRequestSchema.safeParse({
      confirmationText: "DELETE",
      reason: "No longer needed."
    });

    expect(invalidResult.success).toBe(false);
    expect(validResult.success).toBe(true);
  });
});
