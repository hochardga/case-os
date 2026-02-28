"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import type { AuthErrorCode } from "@/lib/auth/error-codes";
import { applySchema } from "@/lib/validation/auth";

type ApplySuccessResponse = ApiSuccess<{ next: string }>;
type ApplyErrorResponse = ApiError;
type ApplyResponse = ApplySuccessResponse | ApplyErrorResponse;
type ApplyErrorCode = AuthErrorCode | "VALIDATION_ERROR";

type FormValues = {
  email: string;
  password: string;
  callsign: string;
};

const initialValues: FormValues = {
  email: "",
  password: "",
  callsign: ""
};

export function ApplyForm() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const callsignRef = useRef<HTMLInputElement>(null);
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalErrorCode, setGeneralErrorCode] = useState<ApplyErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function focusFirstError(errors: ValidationFieldErrors) {
    if (errors.email?.[0]) {
      emailRef.current?.focus();
      return;
    }

    if (errors.password?.[0]) {
      passwordRef.current?.focus();
      return;
    }

    if (errors.callsign?.[0]) {
      callsignRef.current?.focus();
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

    const parsedValues = applySchema.safeParse(formValues);
    if (!parsedValues.success) {
      const nextFieldErrors = parsedValues.error.flatten().fieldErrors;
      setFieldErrors(nextFieldErrors);
      focusFirstError(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedValues.data)
      });

      const result = (await response.json()) as ApplyResponse;
      if (!result.ok) {
        setGeneralError(result.error.message);
        setGeneralErrorCode(result.error.code);
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
          focusFirstError(result.error.fieldErrors);
        }
        return;
      }

      router.push(result.data.next);
    } catch {
      setGeneralError("Application request failed. Please try again.");
      setGeneralErrorCode("UNKNOWN");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="apply-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="apply-email"
          name="email"
          ref={emailRef}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="candidate@ashfall.example"
          type="email"
          value={formValues.email}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.email?.[0])}
          aria-describedby={fieldErrors.email?.[0] ? "apply-email-error" : undefined}
        />
        {fieldErrors.email?.[0] ? (
          <p className="text-xs text-rose-300" id="apply-email-error" role="alert">
            {fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="apply-password">
          Password
        </label>
        <input
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="apply-password"
          name="password"
          ref={passwordRef}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="At least 8 characters"
          type="password"
          value={formValues.password}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.password?.[0])}
          aria-describedby={
            fieldErrors.password?.[0]
              ? "apply-password-help apply-password-error"
              : "apply-password-help"
          }
        />
        <p className="text-xs text-slate-300" id="apply-password-help">
          Password requirements: at least 8 characters.
        </p>
        {fieldErrors.password?.[0] ? (
          <p className="text-xs text-rose-300" id="apply-password-error" role="alert">
            {fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="apply-callsign">
          Callsign
        </label>
        <input
          autoComplete="off"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="apply-callsign"
          name="callsign"
          ref={callsignRef}
          onChange={(event) => updateField("callsign", event.target.value)}
          placeholder="e.g. Ash_01"
          type="text"
          value={formValues.callsign}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.callsign?.[0])}
          aria-describedby={fieldErrors.callsign?.[0] ? "apply-callsign-error" : undefined}
        />
        {fieldErrors.callsign?.[0] ? (
          <p className="text-xs text-rose-300" id="apply-callsign-error" role="alert">
            {fieldErrors.callsign[0]}
          </p>
        ) : null}
      </div>

      {generalError ? (
        <p className="text-sm text-rose-300" role="alert" data-testid="apply-general-error">
          {generalError}
        </p>
      ) : null}

      {generalErrorCode === "EMAIL_ALREADY_IN_USE" ? (
        <p className="text-xs text-slate-300">
          Continue with{" "}
          <Link className="text-cyan-300 underline" href="/login">
            Log In
          </Link>{" "}
          or{" "}
          <Link className="text-cyan-300 underline" href="/reset-password">
            Reset Password
          </Link>
          .
        </p>
      ) : null}

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting}
        data-testid="apply-submit"
      >
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
