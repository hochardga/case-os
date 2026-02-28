import { apiError, apiSuccess, apiValidationError } from "@/lib/api/responses";
import { readRequestJson } from "@/lib/api/request";
import { trackEvent } from "@/lib/analytics/track";
import { mapAuthError } from "@/lib/auth/error-mapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resetPasswordConfirmSchema } from "@/lib/validation/auth";

type TokenInvalidReason = "expired" | "invalid" | "reused";

function inferTokenInvalidReason(error: unknown): TokenInvalidReason {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("reused") || message.includes("already used")) {
    return "reused";
  }

  if (message.includes("expired") || message.includes("otp_expired")) {
    return "expired";
  }

  return "invalid";
}

export async function POST(request: Request) {
  const payload = await readRequestJson(request);
  const parsedPayload = resetPasswordConfirmSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return apiValidationError(parsedPayload.error);
  }

  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      trackEvent("auth_password_reset_token_invalid", {
        reason: "invalid"
      });
      return apiError(
        "TOKEN_INVALID_OR_EXPIRED",
        "Reset link expired or invalid.",
        400
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: parsedPayload.data.newPassword
    });

    if (error) {
      const mappedError = mapAuthError(error);
      if (mappedError.code === "TOKEN_INVALID_OR_EXPIRED") {
        trackEvent("auth_password_reset_token_invalid", {
          reason: inferTokenInvalidReason(error)
        });
      }
      return apiError(mappedError.code, mappedError.message, mappedError.status);
    }

    trackEvent("auth_password_updated", {
      method: "reset_token"
    });
    return apiSuccess({
      message: "Password updated successfully.",
      next: "/login?reset=success"
    });
  } catch (error) {
    const mappedError = mapAuthError(error);
    if (mappedError.code === "TOKEN_INVALID_OR_EXPIRED") {
      trackEvent("auth_password_reset_token_invalid", {
        reason: inferTokenInvalidReason(error)
      });
    }
    return apiError(mappedError.code, mappedError.message, mappedError.status);
  }
}
