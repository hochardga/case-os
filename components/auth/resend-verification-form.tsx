"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import { resendVerificationSchema } from "@/lib/validation/auth";

type ResendSuccessResponse = ApiSuccess<{ message: string }>;
type ResendErrorResponse = ApiError;
type ResendResponse = ResendSuccessResponse | ResendErrorResponse;

type ResendValues = {
  email: string;
};

type ResendVerificationFormProps = {
  initialEmail?: string;
};

export function ResendVerificationForm({ initialEmail = "" }: ResendVerificationFormProps) {
  const [formValues, setFormValues] = useState<ResendValues>({
    email: initialEmail
  });
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setGeneralError(null);
    setConfirmationMessage(null);
    setFieldErrors({});

    const parsedValues = resendVerificationSchema.safeParse(formValues);
    if (!parsedValues.success) {
      setFieldErrors(parsedValues.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/verification/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedValues.data)
      });

      const result = (await response.json()) as ResendResponse;
      if (!result.ok) {
        setGeneralError(result.error.message);
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        }
        return;
      }

      setConfirmationMessage(result.data.message);
    } catch {
      setGeneralError("Unable to resend verification email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
      <label className="text-sm font-medium text-slate-200" htmlFor="resend-verification-email">
        Verification email
      </label>
      <input
        autoComplete="email"
        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
        id="resend-verification-email"
        name="email"
        onChange={(event) => setFormValues({ email: event.target.value })}
        placeholder="candidate@ashfall.example"
        type="email"
        value={formValues.email}
        disabled={isSubmitting}
        aria-invalid={Boolean(fieldErrors.email?.[0])}
        aria-describedby={fieldErrors.email?.[0] ? "resend-verification-email-error" : undefined}
      />
      {fieldErrors.email?.[0] ? (
        <p className="text-xs text-rose-300" id="resend-verification-email-error" role="alert">
          {fieldErrors.email[0]}
        </p>
      ) : null}

      {confirmationMessage ? (
        <p className="text-xs text-emerald-300" role="status">
          {confirmationMessage}
        </p>
      ) : null}
      {generalError ? (
        <p className="text-xs text-rose-300" role="alert">
          {generalError}
        </p>
      ) : null}

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting}
        data-testid="resend-verification-submit"
      >
        {isSubmitting ? "Resending..." : "Resend verification email"}
      </Button>
    </form>
  );
}
