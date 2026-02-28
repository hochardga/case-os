"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import type { AuthErrorCode } from "@/lib/auth/error-codes";
import { loginSchema } from "@/lib/validation/auth";

type LoginSuccessResponse = ApiSuccess<{ next: string }>;
type LoginErrorResponse = ApiError;
type LoginResponse = LoginSuccessResponse | LoginErrorResponse;
type LoginErrorCode = AuthErrorCode | "VALIDATION_ERROR";

type LoginFormProps = {
  next?: string;
};

type LoginValues = {
  email: string;
  password: string;
  next?: string;
};

function getInitialValues(next?: string): LoginValues {
  return {
    email: "",
    password: "",
    ...(next ? { next } : {})
  };
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [formValues, setFormValues] = useState<LoginValues>(getInitialValues(next));
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalErrorCode, setGeneralErrorCode] = useState<LoginErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const encodedEmail = encodeURIComponent(formValues.email.trim().toLowerCase());
  const resendVerificationHref = `/apply/review?verification=expired&email=${encodedEmail}`;

  function focusFirstError(errors: ValidationFieldErrors) {
    if (errors.email?.[0]) {
      emailRef.current?.focus();
      return;
    }

    if (errors.password?.[0]) {
      passwordRef.current?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setGeneralError(null);
    setGeneralErrorCode(null);
    setFieldErrors({});

    const parsedValues = loginSchema.safeParse(formValues);
    if (!parsedValues.success) {
      const nextFieldErrors = parsedValues.error.flatten().fieldErrors;
      setFieldErrors(nextFieldErrors);
      focusFirstError(nextFieldErrors);
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
        setGeneralErrorCode(result.error.code);
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
          focusFirstError(result.error.fieldErrors);
        }
        return;
      }

      router.replace(result.data.next);
      router.refresh();
      return;
    } catch {
      setGeneralError("Login request failed. Please try again.");
      setGeneralErrorCode("UNKNOWN");
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
          ref={emailRef}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="candidate@ashfall.example"
          type="email"
          value={formValues.email}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.email?.[0])}
          aria-describedby={fieldErrors.email?.[0] ? "login-email-error" : undefined}
        />
        {fieldErrors.email?.[0] ? (
          <p className="text-xs text-rose-300" id="login-email-error" role="alert">
            {fieldErrors.email[0]}
          </p>
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
          ref={passwordRef}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="Your password"
          type="password"
          value={formValues.password}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.password?.[0])}
          aria-describedby={fieldErrors.password?.[0] ? "login-password-error" : undefined}
        />
        {fieldErrors.password?.[0] ? (
          <p className="text-xs text-rose-300" id="login-password-error" role="alert">
            {fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {generalError ? (
        <p className="text-sm text-rose-300" role="alert">
          {generalError}
        </p>
      ) : null}
      {generalErrorCode === "UNVERIFIED_EMAIL" ? (
        <p className="text-xs text-slate-300">
          Need a new link?{" "}
          <Link className="text-cyan-300 underline" href={resendVerificationHref}>
            Resend verification email
          </Link>
        </p>
      ) : null}

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
