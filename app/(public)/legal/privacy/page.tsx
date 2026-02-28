export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Privacy Statement</h1>
      <p className="mt-4 text-sm text-slate-300">
        Ashfall stores account details required to provide candidate access,
        including email address, profile metadata, and account security records.
      </p>
      <p className="mt-3 text-sm text-slate-300">
        Data is used for authentication, account support, and operational
        security. We do not expose authentication tokens to browser storage.
      </p>
      <p className="mt-3 text-sm text-slate-300">
        Candidates may submit an account deletion request from the Candidate File
        screen.
      </p>
    </section>
  );
}
