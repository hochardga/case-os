"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import { loginSchema } from "@/lib/validation/auth";

type LoginSuccessResponse = ApiSuccess<{ next: string }>;
type LoginErrorResponse = ApiError;
type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

type LoginValues = {
  email: string;
  password: string;
};

const initialValues: LoginValues = {
  email: "",
  password: ""
};

export function LoginForm() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<LoginValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setGeneralError(null);
    setFieldErrors({});

    const parsedValues = loginSchema.safeParse(formValues);
    if (!parsedValues.success) {
      setFieldErrors(parsedValues.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedValues.data)
      });

      const result = (await response.json()) as LoginResponse;
      if (!result.ok) {
        setGeneralError(result.error.message);
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        }
        return;
      }

      router.push(result.data.next);
    } catch {
      setGeneralError("Login request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof LoginValues>(key: K, value: LoginValues[K]) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="login-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="login-email"
          name="email"
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="candidate@ashfall.example"
          type="email"
          value={formValues.email}
          disabled={isSubmitting}
        />
        {fieldErrors.email?.[0] ? (
          <p className="text-xs text-rose-300">{fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="login-password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="login-password"
          name="password"
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="Your password"
          type="password"
          value={formValues.password}
          disabled={isSubmitting}
        />
        {fieldErrors.password?.[0] ? (
          <p className="text-xs text-rose-300">{fieldErrors.password[0]}</p>
        ) : null}
      </div>

      {generalError ? <p className="text-sm text-rose-300">{generalError}</p> : null}

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting}
        data-testid="login-submit"
      >
        {isSubmitting ? "Signing In..." : "Log In"}
      </Button>

      <p className="text-xs text-slate-400">
        Forgot your password?{" "}
        <Link className="text-cyan-300 underline" href="/reset-password">
          Reset access
        </Link>
      </p>
    </form>
  );
}

