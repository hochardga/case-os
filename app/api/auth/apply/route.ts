import { apiError, apiSuccess, apiValidationError } from "@/lib/api/responses";
import { readRequestJson } from "@/lib/api/request";
import { trackEvent } from "@/lib/analytics/track";
import { mapAuthError } from "@/lib/auth/error-mapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { applySchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const payload = await readRequestJson(request);
  const parsedPayload = applySchema.safeParse(payload);

  if (!parsedPayload.success) {
    trackEvent("auth_apply_failed", {
      error_code: "VALIDATION_ERROR",
      is_validation_error: true
    });
    return apiValidationError(parsedPayload.error);
  }

  const emailDomain = parsedPayload.data.email.split("@")[1] ?? "unknown";
  trackEvent("auth_apply_submitted", {
    callsign_length: parsedPayload.data.callsign.length,
    email_domain: emailDomain
  });

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsedPayload.data.email,
      password: parsedPayload.data.password,
      options: {
        data: {
          callsign: parsedPayload.data.callsign
        }
      }
    });

    if (error) {
      const mappedError = mapAuthError(error);
      trackEvent("auth_apply_failed", {
        error_code: mappedError.code,
        is_validation_error: false
      });
      return apiError(mappedError.code, mappedError.message, mappedError.status);
    }

    trackEvent("auth_apply_succeeded", {
      user_id: data.user?.id ?? null
    });
    trackEvent("profile_created", {
      user_id: data.user?.id ?? null,
      callsign: parsedPayload.data.callsign
    });

    return apiSuccess({ next: "/apply/review" });
  } catch (error) {
    const mappedError = mapAuthError(error);
    trackEvent("auth_apply_failed", {
      error_code: mappedError.code,
      is_validation_error: false
    });
    return apiError(mappedError.code, mappedError.message, mappedError.status);
  }
}
