import { apiError, apiSuccess, apiValidationError } from "@/lib/api/responses";
import { readRequestJson } from "@/lib/api/request";
import { trackEvent } from "@/lib/analytics/track";
import { mapAuthError } from "@/lib/auth/error-mapper";
import { checkAuthRateLimit } from "@/lib/auth/rate-limit";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resendVerificationSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const payload = await readRequestJson(request);
  const parsedPayload = resendVerificationSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return apiValidationError(parsedPayload.error);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
  const emailDomain = parsedPayload.data.email.split("@")[1] ?? "unknown";

  const origin = new URL(request.url).origin;
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/apply/accepted")}&type=signup`;

  try {
    const rateLimit = await checkAuthRateLimit({
      action: "verification_resend",
      subject: parsedPayload.data.email,
      ipAddress
    });
    if (!rateLimit.allowed) {
      trackEvent("auth_rate_limited", {
        action: "verification_resend",
        retry_after_seconds: rateLimit.retryAfterSeconds
      });
      return apiError(
        "RATE_LIMITED",
        "Too many attempts. Please wait and try again.",
        429,
        undefined,
        rateLimit.retryAfterSeconds
      );
    }
  } catch (error) {
    const mappedError = mapAuthError(error);
    return apiError(mappedError.code, mappedError.message, mappedError.status);
  }

  trackEvent("auth_verification_resend_requested", {
    email_domain: emailDomain
  });

  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.resend({
      type: "signup",
      email: parsedPayload.data.email,
      options: {
        emailRedirectTo
      }
    });
  } catch {
    // Keep response neutral to avoid account enumeration.
  }

  return apiSuccess({
    message: "If the account is eligible, a new verification email has been sent."
  });
}
