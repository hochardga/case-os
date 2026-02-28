import { ResetPasswordUpdateForm } from "@/components/auth/reset-password-update-form";

export default function ResetPasswordUpdatePage() {
  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Set a new password</h1>
      <p className="mt-3 text-sm text-slate-300">
        Enter and confirm your new password to finish restoring access.
      </p>
      <ResetPasswordUpdateForm />
    </section>
  );
}
