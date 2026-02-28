import { apiError, apiSuccess, apiValidationError } from "@/lib/api/responses";
import { readRequestJson } from "@/lib/api/request";
import { trackEvent } from "@/lib/analytics/track";
import { mapAuthError } from "@/lib/auth/error-mapper";
import { checkAuthRateLimit } from "@/lib/auth/rate-limit";
import { sanitizeNextPath } from "@/lib/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const payload = await readRequestJson(request);
  const parsedPayload = loginSchema.safeParse(payload);

  if (!parsedPayload.success) {
    trackEvent("auth_login_failed", { error_code: "VALIDATION_ERROR" });
    return apiValidationError(parsedPayload.error);
  }

  const emailDomain = parsedPayload.data.email.split("@")[1] ?? "unknown";
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;

  try {
    const rateLimit = await checkAuthRateLimit({
      action: "login",
      subject: parsedPayload.data.email,
      ipAddress
    });
    if (!rateLimit.allowed) {
      trackEvent("auth_rate_limited", {
        action: "login",
        retry_after_seconds: rateLimit.retryAfterSeconds
      });
      trackEvent("auth_login_failed", { error_code: "RATE_LIMITED" });
      return apiError(
        "RATE_LIMITED",
        "Too many attempts. Please wait and try again.",
        429,
        undefined,
        rateLimit.retryAfterSeconds
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsedPayload.data.email,
      password: parsedPayload.data.password
    });

    if (error) {
      const mappedError = mapAuthError(error);
      trackEvent("auth_login_failed", { error_code: mappedError.code });
      if (mappedError.code === "UNVERIFIED_EMAIL") {
        trackEvent("auth_login_blocked_unverified", {
          email_domain: emailDomain
        });
      }
      return apiError(mappedError.code, mappedError.message, mappedError.status);
    }

    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      trackEvent("auth_login_failed", { error_code: "UNVERIFIED_EMAIL" });
      trackEvent("auth_login_blocked_unverified", {
        email_domain: emailDomain
      });
      return apiError(
        "UNVERIFIED_EMAIL",
        "Please verify your email before accessing the Archive.",
        403
      );
    }

    const next = sanitizeNextPath(parsedPayload.data.next, "/archive");
    trackEvent("auth_login_succeeded", {
      user_id: data.user?.id ?? null,
      method: "password",
      redirect_target: next
    });
    return apiSuccess({ next });
  } catch (error) {
    const mappedError = mapAuthError(error);
    trackEvent("auth_login_failed", { error_code: mappedError.code });
    return apiError(mappedError.code, mappedError.message, mappedError.status);
  }
}
