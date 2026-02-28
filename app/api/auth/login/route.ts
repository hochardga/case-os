import { apiError, apiSuccess, apiValidationError } from "@/lib/api/responses";
import { readRequestJson } from "@/lib/api/request";
import { trackEvent } from "@/lib/analytics/track";
import { mapAuthError } from "@/lib/auth/error-mapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const payload = await readRequestJson(request);
  const parsedPayload = loginSchema.safeParse(payload);

  if (!parsedPayload.success) {
    trackEvent("auth_login_failed", { error_code: "VALIDATION_ERROR" });
    return apiValidationError(parsedPayload.error);
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsedPayload.data.email,
      password: parsedPayload.data.password
    });

    if (error) {
      const mappedError = mapAuthError(error);
      trackEvent("auth_login_failed", { error_code: mappedError.code });
      return apiError(mappedError.code, mappedError.message, mappedError.status);
    }

    trackEvent("auth_login_succeeded", {
      user_id: data.user?.id ?? null,
      method: "password"
    });
    return apiSuccess({ next: "/archive" });
  } catch (error) {
    const mappedError = mapAuthError(error);
    trackEvent("auth_login_failed", { error_code: mappedError.code });
    return apiError(mappedError.code, mappedError.message, mappedError.status);
  }
}
