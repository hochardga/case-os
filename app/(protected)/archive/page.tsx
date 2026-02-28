import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { trackEvent } from "@/lib/analytics/track";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ArchiveViewProps = {
  callsign: string;
};

function ArchiveView({ callsign }: ArchiveViewProps) {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Archive Access</h1>
      <dl className="mt-5 grid grid-cols-1 gap-4 rounded-md border border-slate-800 bg-slate-950/60 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-400">Callsign</dt>
          <dd className="mt-1 font-semibold text-slate-100" data-testid="archive-callsign">
            {callsign}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Clearance</dt>
          <dd className="mt-1 font-semibold text-slate-100">Candidate (Phase 1 Placeholder)</dd>
        </div>
      </dl>
      <div className="mt-6 rounded-md border border-cyan-900/40 bg-cyan-950/30 p-4">
        <h2 className="text-base font-semibold text-cyan-100">
          Case Library is coming soon
        </h2>
        <p className="mt-2 text-sm text-cyan-200/90">
          Archive indexing and dossier access unlock in a later phase.
        </p>
      </div>
    </section>
  );
}

function ArchiveFallback() {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-amber-800 bg-amber-950/30 p-8">
      <h1 className="text-2xl font-semibold text-amber-100">Archive Access</h1>
      <p className="mt-3 text-sm text-amber-200/90">
        We could not load your candidate profile. Please try refreshing or log in again.
      </p>
    </section>
  );
}

function getE2EBypassUser() {
  if (process.env.PHASE1_E2E_AUTH_BYPASS !== "1") {
    return null;
  }

  const value = cookies().get("phase1-e2e-user")?.value;
  if (!value) {
    return null;
  }

  const [id, callsign] = value.split(":");
  if (!id || !callsign) {
    return null;
  }

  return { id, callsign };
}

export default async function ArchivePage() {
  const bypassUser = getE2EBypassUser();
  if (process.env.PHASE1_E2E_AUTH_BYPASS === "1") {
    if (!bypassUser) {
      redirect("/login");
    }

    trackEvent("archive_access_viewed", {
      user_id: bypassUser.id,
      clearance_label: "Candidate"
    });
    return <ArchiveView callsign={bypassUser.callsign} />;
  }

  const supabase = createServerSupabaseClient();
  let userId: string;
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.id) {
      redirect("/login");
    }

    userId = user.id;
  } catch {
    redirect("/login");
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("callsign")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile?.callsign) {
      trackEvent("profile_load_failed", {
        user_id: userId,
        error_code: error?.code ?? "PROFILE_NOT_FOUND"
      });
      return <ArchiveFallback />;
    }

    trackEvent("archive_access_viewed", {
      user_id: userId,
      clearance_label: "Candidate"
    });
    return <ArchiveView callsign={profile.callsign} />;
  } catch {
    trackEvent("profile_load_failed", {
      user_id: userId,
      error_code: "PROFILE_LOOKUP_FAILED"
    });
    return <ArchiveFallback />;
  }
}
