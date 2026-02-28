import Link from "next/link";

export function LegalNotice() {
  return (
    <div className="mt-6 space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
      <p>We store your email and profile information for account management.</p>
      <p>
        By continuing, you acknowledge our{" "}
        <Link className="text-cyan-300 underline" href="/legal/privacy">
          Privacy Statement
        </Link>{" "}
        and{" "}
        <Link className="text-cyan-300 underline" href="/legal/terms">
          Terms
        </Link>
        .
      </p>
    </div>
  );
}
