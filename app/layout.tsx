import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ashfall Case Library",
  description: "Secure onboarding portal for the Ashfall Investigative Collective."
};

type RootLayoutProps = {
  children: ReactNode;
};

function hasSupabaseAuthCookie() {
  const cookieStore = cookies();
  const hasSupabaseCookie = cookieStore
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));
  if (hasSupabaseCookie) {
    return true;
  }

  // Test-only bypass used by Playwright to validate protected-route behavior.
  if (process.env.PHASE1_E2E_AUTH_BYPASS === "1") {
    return cookieStore.get("phase1-e2e-user") !== undefined;
  }

  return false;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const isAuthenticated = hasSupabaseAuthCookie();

  return (
    <html lang="en">
      <body>
        <AppShell isAuthenticated={isAuthenticated}>{children}</AppShell>
      </body>
    </html>
  );
}
