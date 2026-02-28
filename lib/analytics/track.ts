import {
  ANALYTICS_PHASE,
  type AnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsEventPayload,
  type AnalyticsSource,
  type TrackEventContext
} from "@/lib/analytics/events";

type AnalyticsProvider = "console" | "posthog";

function getProvider(): AnalyticsProvider {
  if (process.env.ANALYTICS_PROVIDER === "posthog") {
    return "posthog";
  }

  if (process.env.ANALYTICS_PROVIDER === "console") {
    return "console";
  }

  return process.env.POSTHOG_API_KEY && process.env.POSTHOG_HOST
    ? "posthog"
    : "console";
}

function createSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resolveUserId<E extends AnalyticsEventName>(
  payload: AnalyticsEventPayload<E>,
  context?: TrackEventContext
) {
  if (Object.prototype.hasOwnProperty.call(payload, "user_id")) {
    const maybeUserId = (payload as { user_id?: string | null }).user_id;
    return maybeUserId ?? null;
  }

  return context?.userId ?? null;
}

export function buildAnalyticsEvent<E extends AnalyticsEventName>(
  eventName: E,
  payload: AnalyticsEventPayload<E>,
  context?: TrackEventContext
): AnalyticsEvent<E> {
  const source: AnalyticsSource = context?.source ?? "server";
  const sessionId = context?.sessionId ?? createSessionId();

  return {
    event_name: eventName,
    user_id: resolveUserId(payload, context),
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    source,
    phase: ANALYTICS_PHASE,
    ...payload
  };
}

async function dispatchToPostHog(event: AnalyticsEvent<AnalyticsEventName>) {
  const posthogHost = process.env.POSTHOG_HOST;
  const posthogApiKey = process.env.POSTHOG_API_KEY;

  if (!posthogHost || !posthogApiKey) {
    dispatchToConsole(event);
    return;
  }

  await fetch(`${posthogHost.replace(/\/$/, "")}/capture/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: posthogApiKey,
      event: event.event_name,
      properties: event
    })
  });
}

function dispatchToConsole(event: AnalyticsEvent<AnalyticsEventName>) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event.event_name, event);
  }
}

async function dispatchEvent(event: AnalyticsEvent<AnalyticsEventName>) {
  try {
    if (getProvider() === "posthog") {
      await dispatchToPostHog(event);
      return;
    }

    dispatchToConsole(event);
  } catch {
    // Telemetry must never break user flows.
  }
}

export function trackEvent<E extends AnalyticsEventName>(
  eventName: E,
  payload: AnalyticsEventPayload<E>,
  context?: TrackEventContext
) {
  const event = buildAnalyticsEvent(eventName, payload, context);
  void dispatchEvent(event as AnalyticsEvent<AnalyticsEventName>);
}

