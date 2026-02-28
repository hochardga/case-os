import { describe, expect, it } from "vitest";

import {
  buildLoginRedirect,
  isSafeRelativePath,
  sanitizeNextPath
} from "@/lib/auth/redirects";

describe("auth redirects", () => {
  it("accepts safe internal relative paths", () => {
    expect(isSafeRelativePath("/archive")).toBe(true);
    expect(isSafeRelativePath("/candidate-file?tab=account")).toBe(true);
  });

  it("rejects unsafe or external redirect paths", () => {
    expect(isSafeRelativePath("https://evil.example")).toBe(false);
    expect(isSafeRelativePath("//evil.example")).toBe(false);
    expect(isSafeRelativePath("javascript:alert(1)")).toBe(false);
  });

  it("sanitizes next to fallback when value is unsafe", () => {
    expect(sanitizeNextPath("https://evil.example")).toBe("/archive");
    expect(sanitizeNextPath("   ")).toBe("/archive");
    expect(sanitizeNextPath(undefined)).toBe("/archive");
  });

  it("preserves safe next paths", () => {
    expect(sanitizeNextPath("/archive?mode=resume")).toBe("/archive?mode=resume");
  });

  it("builds a login redirect with encoded safe next", () => {
    expect(buildLoginRedirect("/candidate-file")).toBe(
      "/login?next=%2Fcandidate-file"
    );
    expect(buildLoginRedirect("https://evil.example")).toBe(
      "/login?next=%2Farchive"
    );
  });
});
