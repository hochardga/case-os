import { apiError, apiSuccess, apiValidationError } from "@/lib/api/responses";
import { readRequestJson } from "@/lib/api/request";
import { trackEvent } from "@/lib/analytics/track";
import { mapAuthError } from "@/lib/auth/error-mapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { accountDeletionRequestSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const payload = await readRequestJson(request);
  const parsedPayload = accountDeletionRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return apiValidationError(parsedPayload.error);
  }

  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return apiError("INVALID_CREDENTIALS", "Please log in to continue.", 401);
    }

    const reason = parsedPayload.data.reason?.trim();
    const { error } = await supabase.from("account_deletion_requests").insert({
      user_id: user.id,
      reason: reason && reason.length > 0 ? reason : null
    });

    if (error) {
      if (error.code === "23505") {
        return apiError(
          "UNKNOWN",
          "An account deletion request is already pending.",
          409
        );
      }
      const mappedError = mapAuthError(error);
      return apiError(mappedError.code, mappedError.message, mappedError.status);
    }

    trackEvent("auth_account_deletion_requested", {
      user_id: user.id,
      request_channel: "self_service"
    });

    return apiSuccess({
      message: "Account deletion request received."
    });
  } catch (error) {
    const mappedError = mapAuthError(error);
    return apiError(mappedError.code, mappedError.message, mappedError.status);
  }
}
