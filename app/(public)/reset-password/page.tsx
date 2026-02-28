import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Reset Password</h1>
      <p className="mt-3 text-sm text-slate-300">
        Request new credentials for your candidate file.
      </p>
      <ResetPasswordForm />
    </section>
  );
}
