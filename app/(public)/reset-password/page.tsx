import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LegalNotice } from "@/components/auth/legal-notice";
import { trackEvent } from "@/lib/analytics/track";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    auth_error?: string | string[];
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawAuthError = resolvedSearchParams?.auth_error;
  const authError = Array.isArray(rawAuthError) ? rawAuthError[0] : rawAuthError;
  const showExpiredState = authError === "link_invalid";

  if (showExpiredState) {
    trackEvent("auth_password_reset_token_invalid", {
      reason: "invalid"
    });
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Reset Password</h1>
      {showExpiredState ? (
        <p className="mt-3 rounded-md border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          Reset link expired or invalid.
        </p>
      ) : null}
      <p className="mt-3 text-sm text-slate-300">
        Request new credentials for your candidate file.
      </p>
      <ResetPasswordForm submitLabel={showExpiredState ? "Request new reset link" : undefined} />
      <LegalNotice />
    </section>
  );
}
