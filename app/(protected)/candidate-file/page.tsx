import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AccountDeletionRequestForm } from "@/components/auth/account-deletion-request-form";
import { ProtectedPageGuard } from "@/components/auth/protected-page-guard";
import { trackEvent } from "@/lib/analytics/track";
import { buildLoginRedirect } from "@/lib/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CANDIDATE_FILE_ROUTE = "/candidate-file";

type CandidateFileViewProps = {
  userId: string;
  callsign: string;
};

function CandidateFileView({ userId, callsign }: CandidateFileViewProps) {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <ProtectedPageGuard />
      <h1 className="text-2xl font-semibold text-slate-50">Candidate File</h1>
      <p className="mt-3 text-sm text-slate-300">
        Manage your candidate profile details and account requests.
      </p>

      <dl className="mt-5 grid grid-cols-1 gap-4 rounded-md border border-slate-800 bg-slate-950/60 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-400">Callsign</dt>
          <dd className="mt-1 font-semibold text-slate-100" data-testid="candidate-file-callsign">
            {callsign}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">User ID</dt>
          <dd className="mt-1 font-mono text-xs text-slate-200" data-testid="candidate-file-user-id">
            {userId}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <AccountDeletionRequestForm />
      </div>
    </section>
  );
}

function CandidateFileFallback() {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-amber-800 bg-amber-950/30 p-8">
      <h1 className="text-2xl font-semibold text-amber-100">Candidate File</h1>
      <p className="mt-3 text-sm text-amber-200/90">
        We could not load your profile details. Please try refreshing or log in again.
      </p>
      <div className="mt-6">
        <AccountDeletionRequestForm />
      </div>
    </section>
  );
}

async function getE2EBypassUser() {
  if (process.env.PHASE1_E2E_AUTH_BYPASS !== "1") {
    return null;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get("phase1-e2e-user")?.value;
  if (!value) {
    return null;
  }

  const [id, callsign] = value.split(":");
  if (!id || !callsign) {
    return null;
  }

  return { id, callsign };
}

async function hasSupabaseAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
    );
}

function redirectToLogin(isSessionExpired: boolean): never {
  const loginRedirect = buildLoginRedirect(CANDIDATE_FILE_ROUTE);
  if (isSessionExpired) {
    trackEvent("auth_session_expired", {
      route: CANDIDATE_FILE_ROUTE
    });
    redirect(`${loginRedirect}&session=expired`);
  }

  redirect(loginRedirect);
}

export default async function CandidateFilePage() {
  const hasAuthCookie = await hasSupabaseAuthCookie();
  const bypassUser = await getE2EBypassUser();

  if (process.env.PHASE1_E2E_AUTH_BYPASS === "1") {
    if (!bypassUser) {
      redirectToLogin(hasAuthCookie);
    }

    return <CandidateFileView callsign={bypassUser.callsign} userId={bypassUser.id} />;
  }

  const supabase = createServerSupabaseClient();
  let userId: string;

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user?.id) {
      redirectToLogin(hasAuthCookie);
    }
    userId = user.id;
  } catch {
    redirectToLogin(hasAuthCookie);
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("callsign")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile?.callsign) {
      return <CandidateFileFallback />;
    }

    return <CandidateFileView callsign={profile.callsign} userId={userId} />;
  } catch {
    return <CandidateFileFallback />;
  }
}
