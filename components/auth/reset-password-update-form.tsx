"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import { resetPasswordConfirmSchema } from "@/lib/validation/auth";

type ResetUpdateSuccessResponse = ApiSuccess<{ message: string; next: string }>;
type ResetUpdateErrorResponse = ApiError;
type ResetUpdateResponse = ResetUpdateSuccessResponse | ResetUpdateErrorResponse;

type ResetUpdateValues = {
  newPassword: string;
  confirmPassword: string;
};

const initialValues: ResetUpdateValues = {
  newPassword: "",
  confirmPassword: ""
};

export function ResetPasswordUpdateForm() {
  const router = useRouter();
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [formValues, setFormValues] = useState<ResetUpdateValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function focusFirstError(errors: ValidationFieldErrors) {
    if (errors.newPassword?.[0]) {
      newPasswordRef.current?.focus();
      return;
    }

    if (errors.confirmPassword?.[0]) {
      confirmPasswordRef.current?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setGeneralError(null);
    setFieldErrors({});

    const parsedValues = resetPasswordConfirmSchema.safeParse(formValues);
    if (!parsedValues.success) {
      const nextFieldErrors = parsedValues.error.flatten().fieldErrors;
      setFieldErrors(nextFieldErrors);
      focusFirstError(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedValues.data)
      });

      const result = (await response.json()) as ResetUpdateResponse;
      if (!result.ok) {
        setGeneralError(result.error.message);
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
          focusFirstError(result.error.fieldErrors);
        }
        return;
      }

      router.push(result.data.next);
    } catch {
      setGeneralError("Unable to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-200"
          htmlFor="reset-update-new-password"
        >
          New password
        </label>
        <input
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="reset-update-new-password"
          name="newPassword"
          ref={newPasswordRef}
          onChange={(event) =>
            setFormValues((current) => ({ ...current, newPassword: event.target.value }))
          }
          placeholder="At least 8 characters"
          type="password"
          value={formValues.newPassword}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.newPassword?.[0])}
          aria-describedby={
            fieldErrors.newPassword?.[0] ? "reset-update-new-password-error" : undefined
          }
        />
        {fieldErrors.newPassword?.[0] ? (
          <p className="text-xs text-rose-300" role="alert" id="reset-update-new-password-error">
            {fieldErrors.newPassword[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-200"
          htmlFor="reset-update-confirm-password"
        >
          Confirm password
        </label>
        <input
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="reset-update-confirm-password"
          name="confirmPassword"
          ref={confirmPasswordRef}
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              confirmPassword: event.target.value
            }))
          }
          placeholder="Retype your password"
          type="password"
          value={formValues.confirmPassword}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.confirmPassword?.[0])}
          aria-describedby={
            fieldErrors.confirmPassword?.[0]
              ? "reset-update-confirm-password-error"
              : undefined
          }
        />
        {fieldErrors.confirmPassword?.[0] ? (
          <p
            className="text-xs text-rose-300"
            role="alert"
            id="reset-update-confirm-password-error"
          >
            {fieldErrors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      {generalError ? (
        <p className="text-sm text-rose-300" role="alert" data-testid="reset-update-error">
          {generalError}
        </p>
      ) : null}
      {generalError === "Reset link expired or invalid." ? (
        <p className="text-xs text-slate-300">
          <Link className="text-cyan-300 underline" href="/reset-password">
            Request new reset link
          </Link>
        </p>
      ) : null}

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting}
        data-testid="reset-update-submit"
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
