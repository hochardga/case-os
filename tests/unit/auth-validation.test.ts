import { describe, expect, it } from "vitest";

import {
  applySchema,
  loginSchema,
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

  it("rejects reset payloads with invalid email", () => {
    const result = resetPasswordSchema.safeParse({
      email: "not-an-email"
    });

    expect(result.success).toBe(false);
  });
});

