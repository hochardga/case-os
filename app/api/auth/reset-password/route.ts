import { apiSuccess, apiValidationError } from "@/lib/api/responses";
import { readRequestJson } from "@/lib/api/request";
import { trackEvent } from "@/lib/analytics/track";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const payload = await readRequestJson(request);
  const parsedPayload = resetPasswordSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return apiValidationError(parsedPayload.error);
  }

  const emailDomain = parsedPayload.data.email.split("@")[1] ?? "unknown";
  trackEvent("auth_password_reset_requested", {
    email_domain: emailDomain
  });

  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.resetPasswordForEmail(parsedPayload.data.email);
  } catch {
    // Avoid account enumeration by always returning generic success.
  }

  return apiSuccess({
    message: "If an account exists, reset instructions were sent."
  });
}
