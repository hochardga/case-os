import { describe, expect, it } from "vitest";

import { getSupabaseEnv } from "@/lib/env";

describe("getSupabaseEnv", () => {
  it("returns env values when required variables are present", () => {
    const env = getSupabaseEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key"
    });

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("test-anon-key");
  });

  it("throws a clear error when required variables are missing", () => {
    expect(() =>
      getSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co"
      })
    ).toThrowError(
      "Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  });

  it("throws a clear error when SUPABASE URL is invalid", () => {
    expect(() =>
      getSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key"
      })
    ).toThrowError(
      "Invalid NEXT_PUBLIC_SUPABASE_URL. Expected a valid absolute URL."
    );
  });
});

