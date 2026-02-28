"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import { resetPasswordSchema } from "@/lib/validation/auth";

type ResetSuccessResponse = ApiSuccess<{ message: string }>;
type ResetErrorResponse = ApiError;
type ResetResponse = ResetSuccessResponse | ResetErrorResponse;

type ResetValues = {
  email: string;
};

type ResetPasswordFormProps = {
  submitLabel?: string;
};

const initialValues: ResetValues = {
  email: ""
};

export function ResetPasswordForm({ submitLabel = "Request Reset Link" }: ResetPasswordFormProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLParagraphElement>(null);
  const [formValues, setFormValues] = useState<ResetValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  function focusFirstError(errors: ValidationFieldErrors) {
    if (errors.email?.[0]) {
      emailRef.current?.focus();
    }
  }

  useEffect(() => {
    if (confirmationMessage) {
      confirmationRef.current?.focus();
    }
  }, [confirmationMessage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setGeneralError(null);
    setConfirmationMessage(null);
    setFieldErrors({});

    const parsedValues = resetPasswordSchema.safeParse(formValues);
    if (!parsedValues.success) {
      const nextFieldErrors = parsedValues.error.flatten().fieldErrors;
      setFieldErrors(nextFieldErrors);
      focusFirstError(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedValues.data)
      });

      const result = (await response.json()) as ResetResponse;
      if (!result.ok) {
        setGeneralError(result.error.message);
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
          focusFirstError(result.error.fieldErrors);
        }
        return;
      }

      setConfirmationMessage(result.data.message);
    } catch {
      setGeneralError("Reset request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="reset-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="reset-email"
          name="email"
          ref={emailRef}
          onChange={(event) => setFormValues({ email: event.target.value })}
          placeholder="candidate@ashfall.example"
          type="email"
          value={formValues.email}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.email?.[0])}
          aria-describedby={fieldErrors.email?.[0] ? "reset-email-error" : undefined}
        />
        {fieldErrors.email?.[0] ? (
          <p className="text-xs text-rose-300" id="reset-email-error" role="alert">
            {fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      {confirmationMessage ? (
        <p
          className="text-sm text-emerald-300"
          role="status"
          tabIndex={-1}
          ref={confirmationRef}
        >
          {confirmationMessage}
        </p>
      ) : null}
      {generalError ? (
        <p className="text-sm text-rose-300" role="alert">
          {generalError}
        </p>
      ) : null}

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting}
        data-testid="reset-submit"
      >
        {isSubmitting ? "Requesting..." : submitLabel}
      </Button>
    </form>
  );
}
