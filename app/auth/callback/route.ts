import { NextResponse, type NextRequest } from "next/server";

import { resolveCallbackRedirect } from "@/lib/auth/callback-redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function handleE2EBypass(request: NextRequest) {
  if (process.env.PHASE1_E2E_AUTH_BYPASS !== "1") {
    return null;
  }

  const searchParams = request.nextUrl.searchParams;
  const mock = searchParams.get("mock");
  if (!mock) {
    return null;
  }

  const wasSuccessful = mock === "success";
  const next = searchParams.get("next");
  const type = searchParams.get("type");
  const redirectTo = resolveCallbackRedirect({
    next,
    type,
    wasSuccessful
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}

export async function GET(request: NextRequest) {
  const bypassResponse = handleE2EBypass(request);
  if (bypassResponse) {
    return bypassResponse;
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const type = searchParams.get("type");

  if (!code) {
    const redirectTo = resolveCallbackRedirect({
      next,
      type,
      wasSuccessful: false
    });
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const redirectTo = resolveCallbackRedirect({
      next,
      type,
      wasSuccessful: !error
    });
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch {
    const redirectTo = resolveCallbackRedirect({
      next,
      type,
      wasSuccessful: false
    });
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
}
