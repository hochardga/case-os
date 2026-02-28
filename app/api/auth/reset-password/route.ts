import { apiError, apiSuccess, apiValidationError } from "@/lib/api/responses";
import { readRequestJson } from "@/lib/api/request";
import { trackEvent } from "@/lib/analytics/track";
import { mapAuthError } from "@/lib/auth/error-mapper";
import { checkAuthRateLimit } from "@/lib/auth/rate-limit";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resetPasswordRequestSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const payload = await readRequestJson(request);
  const parsedPayload = resetPasswordRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return apiValidationError(parsedPayload.error);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
  const emailDomain = parsedPayload.data.email.split("@")[1] ?? "unknown";

  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/reset-password/update")}&type=recovery`;

  try {
    const rateLimit = await checkAuthRateLimit({
      action: "password_reset",
      subject: parsedPayload.data.email,
      ipAddress
    });
    if (!rateLimit.allowed) {
      trackEvent("auth_rate_limited", {
        action: "password_reset",
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

  trackEvent("auth_password_reset_requested", {
    email_domain: emailDomain
  });

  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.resetPasswordForEmail(parsedPayload.data.email, {
      redirectTo
    });
  } catch {
    // Avoid account enumeration by returning generic success for non-critical upstream errors.
  }

  return apiSuccess({
    message: "If an account exists for this email, you'll receive reset instructions."
  });
}
