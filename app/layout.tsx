import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { trackEvent } from "@/lib/analytics/track";
import { getServerSessionUser } from "@/lib/supabase/server";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ashfall Case Library",
  description: "Secure onboarding portal for the Ashfall Investigative Collective."
};

type RootLayoutProps = {
  children: ReactNode;
};

async function hasE2EBypassUserCookie() {
  const cookieStore = await cookies();
  if (process.env.PHASE1_E2E_AUTH_BYPASS === "1") {
    return cookieStore.get("phase1-e2e-user") !== undefined;
  }

  return null;
}

async function resolveAuthenticatedState() {
  const bypassState = await hasE2EBypassUserCookie();
  if (bypassState !== null) {
    return bypassState;
  }

  try {
    const user = await getServerSessionUser();
    return Boolean(user?.id);
  } catch {
    return false;
  }
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const isAuthenticated = await resolveAuthenticatedState();
  trackEvent("auth_nav_state_rendered", {
    is_authenticated: isAuthenticated,
    has_flicker: false
  });

  return (
    <html lang="en">
      <body>
        <AppShell isAuthenticated={isAuthenticated}>{children}</AppShell>
      </body>
    </html>
  );
}
