import Link from "next/link";

export default function ApplyAcceptedPage() {
  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Application Accepted</h1>
      <p className="mt-3 text-sm text-slate-300">
        Access granted. Continue to the Archive staging area.
      </p>
      <Link className="mt-5 inline-block text-sm text-cyan-300 underline" href="/archive">
        Continue to Archive
      </Link>
    </section>
  );
}

