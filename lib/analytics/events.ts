export const ANALYTICS_PHASE = "phase-002";

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
  auth_nav_state_rendered: {
    is_authenticated: boolean;
    has_flicker: boolean;
  };
  auth_apply_duplicate_email_hint_shown: {
    email_domain: string;
  };
  auth_apply_submitted: {
    callsign_length: number;
    email_domain: string;
  };
  auth_verification_prompt_shown: {
    delivery_channel: "email";
  };
  auth_verification_resend_requested: {
    email_domain: string;
  };
  auth_apply_succeeded: {
    user_id: string | null;
  };
  auth_apply_failed: {
    error_code: string;
    is_validation_error: boolean;
  };
  auth_login_succeeded: {
    user_id: string | null;
    method: "password";
    redirect_target: string;
  };
  auth_login_failed: {
    error_code: string;
  };
  auth_login_blocked_unverified: {
    email_domain: string;
  };
  auth_password_reset_requested: {
    email_domain: string;
  };
  auth_password_reset_token_invalid: {
    reason: "expired" | "invalid" | "reused";
  };
  auth_password_updated: {
    method: "reset_token";
  };
  auth_rate_limited: {
    action: "login" | "password_reset" | "verification_resend";
    retry_after_seconds: number;
  };
  auth_session_expired: {
    route: string;
  };
  auth_logout: {
    user_id: string | null;
    initiator: "user" | "system";
  };
  auth_account_deletion_requested: {
    user_id: string | null;
    request_channel: "self_service";
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
