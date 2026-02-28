import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold text-slate-50">Log In</h1>
      <p className="mt-3 text-sm text-slate-300">
        Authenticate to resume archive access.
      </p>
      <LoginForm />
    </section>
  );
}
