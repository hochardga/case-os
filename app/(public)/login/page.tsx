import { LoginForm } from "@/components/auth/login-form";
import { LegalNotice } from "@/components/auth/legal-notice";
import { sanitizeNextPath } from "@/lib/auth/redirects";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
    reset?: string | string[];
    session?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  const requestedNext = resolvedSearchParams?.next;
  const next = Array.isArray(requestedNext)
    ? sanitizeNextPath(requestedNext[0], "/archive")
    : requestedNext
      ? sanitizeNextPath(requestedNext, "/archive")
      : undefined;
  const resetRaw = resolvedSearchParams?.reset;
  const resetStatus = Array.isArray(resetRaw) ? resetRaw[0] : resetRaw;
  const showResetSuccess = resetStatus === "success";
  const sessionRaw = resolvedSearchParams?.session;
  const sessionStatus = Array.isArray(sessionRaw) ? sessionRaw[0] : sessionRaw;
  const showSessionExpired = sessionStatus === "expired";

  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Log In</h1>
      {showResetSuccess ? (
        <p className="mt-3 rounded-md border border-emerald-700/60 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-100">
          Password updated successfully.
        </p>
      ) : null}
      {showSessionExpired ? (
        <p className="mt-3 rounded-md border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          Your session has expired. Please log in again.
        </p>
      ) : null}
      <p className="mt-3 text-sm text-slate-300">
        Authenticate to resume archive access.
      </p>
      <LoginForm next={next} />
      <LegalNotice />
    </section>
  );
}
