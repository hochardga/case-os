export const ANALYTICS_PHASE = "phase-001";

export type AnalyticsSource = "web_client" | "server";

export type AnalyticsCommonProperties = {
  event_name: AnalyticsEventName;
  user_id: string | null;
  session_id: string;
  timestamp: string;
  source: AnalyticsSource;
  phase: typeof ANALYTICS_PHASE;
};

export type AnalyticsEventProperties = {
  auth_apply_submitted: {
    callsign_length: number;
    email_domain: string;
  };
  auth_apply_succeeded: {
    user_id: string | null;
  };
  auth_apply_failed: {
    error_code: string;
    is_validation_error?: boolean;
  };
  auth_login_succeeded: {
    user_id: string | null;
    method: "password";
  };
  auth_login_failed: {
    error_code: string;
  };
  auth_password_reset_requested: {
    email_domain: string;
  };
  auth_logout: {
    user_id: string | null;
  };
  archive_access_viewed: {
    user_id: string | null;
    clearance_label: string;
  };
  profile_created: {
    user_id: string | null;
    callsign: string;
  };
  profile_load_failed: {
    user_id: string | null;
    error_code: string;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventProperties;

export type AnalyticsEventPayload<E extends AnalyticsEventName> =
  AnalyticsEventProperties[E];

export type AnalyticsEvent<E extends AnalyticsEventName> = AnalyticsCommonProperties &
  AnalyticsEventPayload<E>;

export type TrackEventContext = {
  source?: AnalyticsSource;
  sessionId?: string;
  userId?: string | null;
};

