import { describe, expect, it } from "vitest";

import {
  resolveCallbackFailureRedirect,
  resolveCallbackRedirect,
  resolveCallbackSuccessRedirect
} from "@/lib/auth/callback-redirects";

describe("auth callback redirects", () => {
  it("uses safe next path for successful callback redirects", () => {
    expect(resolveCallbackSuccessRedirect("/apply/accepted", "signup")).toBe(
      "/apply/accepted"
    );
    expect(resolveCallbackSuccessRedirect("/reset-password/update", "recovery")).toBe(
      "/reset-password/update"
    );
  });

  it("falls back when next path is unsafe", () => {
    expect(resolveCallbackSuccessRedirect("https://evil.example", "signup")).toBe(
      "/apply/accepted"
    );
    expect(resolveCallbackSuccessRedirect("//evil.example", "recovery")).toBe(
      "/reset-password/update"
    );
  });

  it("routes failed signup callbacks to verification-expired state", () => {
    expect(resolveCallbackFailureRedirect("signup")).toBe(
      "/apply/review?verification=expired"
    );
  });

  it("routes failed recovery callbacks to reset flow error state", () => {
    expect(resolveCallbackFailureRedirect("recovery")).toBe(
      "/reset-password?auth_error=link_invalid"
    );
  });

  it("resolves redirect for combined success/failure states", () => {
    expect(
      resolveCallbackRedirect({
        next: "/apply/accepted",
        type: "signup",
        wasSuccessful: true
      })
    ).toBe("/apply/accepted");
    expect(
      resolveCallbackRedirect({
        next: "/apply/accepted",
        type: "signup",
        wasSuccessful: false
      })
    ).toBe("/apply/review?verification=expired");
  });
});
