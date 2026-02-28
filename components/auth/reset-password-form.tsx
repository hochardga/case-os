"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import { resetPasswordSchema } from "@/lib/validation/auth";

type ResetSuccessResponse = ApiSuccess<{ message: string }>;
type ResetErrorResponse = ApiError;
type ResetResponse = ResetSuccessResponse | ResetErrorResponse;

type ResetValues = {
  email: string;
};

const initialValues: ResetValues = {
  email: ""
};

export function ResetPasswordForm() {
  const [formValues, setFormValues] = useState<ResetValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setFieldErrors(parsedValues.error.flatten().fieldErrors);
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
          onChange={(event) => setFormValues({ email: event.target.value })}
          placeholder="candidate@ashfall.example"
          type="email"
          value={formValues.email}
          disabled={isSubmitting}
        />
        {fieldErrors.email?.[0] ? (
          <p className="text-xs text-rose-300">{fieldErrors.email[0]}</p>
        ) : null}
      </div>

      {confirmationMessage ? (
        <p className="text-sm text-emerald-300">{confirmationMessage}</p>
      ) : null}
      {generalError ? <p className="text-sm text-rose-300">{generalError}</p> : null}

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting}
        data-testid="reset-submit"
      >
        {isSubmitting ? "Requesting..." : "Request Reset Link"}
      </Button>
    </form>
  );
}

