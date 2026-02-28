import { ApplyForm } from "@/components/auth/apply-form";
import { LegalNotice } from "@/components/auth/legal-notice";

export default function ApplyPage() {
  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Apply to Ashfall</h1>
      <p className="mt-3 text-sm text-slate-300">
        Submit your candidate dossier to the Ashfall Investigative Collective.
      </p>
      <ApplyForm />
      <LegalNotice />
    </section>
  );
}
