import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getServerSessionUser } from "@/lib/supabase/server";

async function hasE2EBypassUserCookie() {
  if (process.env.PHASE1_E2E_AUTH_BYPASS !== "1") {
    return null;
  }

  const cookieStore = await cookies();
  return cookieStore.get("phase1-e2e-user") !== undefined;
}

async function isAuthenticatedUser() {
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

export default async function LandingPage() {
  if (await isAuthenticatedUser()) {
    redirect("/archive");
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-lg border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
        Candidate Intake Portal
      </p>
      <h1 className="text-3xl font-semibold text-slate-50">
        Welcome to the Ashfall Case Library
      </h1>
      <p className="max-w-2xl text-slate-300">
        Begin your application to the Ashfall Investigative Collective. Accepted
        and verified candidates receive restricted archive access.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/apply">Apply</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    </section>
  );
}
