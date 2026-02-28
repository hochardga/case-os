export default function TermsPage() {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Terms</h1>
      <p className="mt-4 text-sm text-slate-300">
        Candidate access is provided for authorized review and onboarding
        purposes only. Misuse, credential sharing, or unauthorized data access
        is prohibited.
      </p>
      <p className="mt-3 text-sm text-slate-300">
        You are responsible for maintaining accurate account details and
        protecting login credentials.
      </p>
      <p className="mt-3 text-sm text-slate-300">
        Security protections, including rate limiting and session controls, may
        block abusive activity.
      </p>
    </section>
  );
}
