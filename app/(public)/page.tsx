import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-lg border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
        Candidate Intake Portal
      </p>
      <h1 className="text-3xl font-semibold text-slate-50">
        Welcome to the Ashfall Case Library
      </h1>
      <p className="max-w-2xl text-slate-300">
        Begin your application to the Ashfall Investigative Collective. Accepted
        candidates receive restricted archive access in Phase 1.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/apply">Apply</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    </section>
  );
}

