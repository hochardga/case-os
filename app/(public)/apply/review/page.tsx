import Link from "next/link";

import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { trackEvent } from "@/lib/analytics/track";

type ApplyReviewPageProps = {
  searchParams?: Promise<{
    verification?: string | string[];
    email?: string | string[];
  }>;
};

export default async function ApplyReviewPage({ searchParams }: ApplyReviewPageProps) {
  const resolvedSearchParams = await searchParams;

  trackEvent("auth_verification_prompt_shown", {
    delivery_channel: "email"
  });

  const verificationStateRaw = resolvedSearchParams?.verification;
  const verificationState = Array.isArray(verificationStateRaw)
    ? verificationStateRaw[0]
    : verificationStateRaw;
  const showExpiredState = verificationState === "expired";

  const emailRaw = resolvedSearchParams?.email;
  const email = Array.isArray(emailRaw) ? emailRaw[0] : emailRaw;

  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">
        Check your inbox to verify access.
      </h1>
      {showExpiredState ? (
        <p className="mt-3 rounded-md border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          Verification link expired.
        </p>
      ) : null}
      <p className="mt-3 text-sm text-slate-300">
        We sent a verification link to your email. Verify your account, then
        continue to acceptance.
      </p>
      <ResendVerificationForm initialEmail={email} />
      <Link
        className="mt-5 inline-block text-sm text-cyan-300 underline"
        href="/apply/accepted"
      >
        I have verified my email
      </Link>
    </section>
  );
}
