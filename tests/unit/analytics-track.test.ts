import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildAnalyticsEvent, trackEvent } from "@/lib/analytics/track";

function flushEventQueue() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("analytics track adapter", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("builds event envelope with required common properties", () => {
    const event = buildAnalyticsEvent("auth_login_succeeded", {
      user_id: "user-1",
      method: "password",
      redirect_target: "/archive"
    });

    expect(event.event_name).toBe("auth_login_succeeded");
    expect(event.user_id).toBe("user-1");
    expect(event.source).toBe("server");
    expect(event.phase).toBe("phase-002");
    expect(event.session_id).toContain("session-");
    expect(new Date(event.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("dispatches auth_login_succeeded to PostHog provider", async () => {
    process.env.ANALYTICS_PROVIDER = "posthog";
    process.env.POSTHOG_HOST = "https://app.posthog.com";
    process.env.POSTHOG_API_KEY = "test-key";

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    trackEvent("auth_login_succeeded", {
      user_id: "user-1",
      method: "password",
      redirect_target: "/archive"
    });

    await flushEventQueue();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://app.posthog.com/capture/");
    expect(init?.method).toBe("POST");
    expect(String(init?.body)).toContain("auth_login_succeeded");
  });

  it("dispatches archive_access_viewed to PostHog provider", async () => {
    process.env.ANALYTICS_PROVIDER = "posthog";
    process.env.POSTHOG_HOST = "https://app.posthog.com";
    process.env.POSTHOG_API_KEY = "test-key";

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    trackEvent("archive_access_viewed", {
      user_id: "user-1",
      clearance_label: "Candidate"
    });

    await flushEventQueue();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][1]?.body)).toContain(
      "archive_access_viewed"
    );
  });

  it("falls back safely when PostHog is disabled", async () => {
    process.env.ANALYTICS_PROVIDER = "console";
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    trackEvent("auth_login_succeeded", {
      user_id: "user-1",
      method: "password",
      redirect_target: "/archive"
    });

    await flushEventQueue();
    expect(infoSpy).toHaveBeenCalled();
  });

  it("supports phase 2 payload contracts for logout and account deletion events", () => {
    const logoutEvent = buildAnalyticsEvent("auth_logout", {
      user_id: "user-1",
      initiator: "user"
    });
    const deletionEvent = buildAnalyticsEvent("auth_account_deletion_requested", {
      user_id: "user-1",
      request_channel: "self_service"
    });

    expect(logoutEvent.initiator).toBe("user");
    expect(logoutEvent.phase).toBe("phase-002");
    expect(deletionEvent.request_channel).toBe("self_service");
    expect(deletionEvent.phase).toBe("phase-002");
  });
});
