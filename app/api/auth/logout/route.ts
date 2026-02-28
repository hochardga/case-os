import { apiError, apiSuccess } from "@/lib/api/responses";
import { trackEvent } from "@/lib/analytics/track";
import { mapAuthError } from "@/lib/auth/error-mapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const { error } = await supabase.auth.signOut();

    if (error) {
      const mappedError = mapAuthError(error);
      return apiError(mappedError.code, mappedError.message, mappedError.status);
    }

    trackEvent("auth_logout", {
      user_id: user?.id ?? null
    });
    return apiSuccess({ next: "/login" });
  } catch (error) {
    const mappedError = mapAuthError(error);
    return apiError(mappedError.code, mappedError.message, mappedError.status);
  }
}
