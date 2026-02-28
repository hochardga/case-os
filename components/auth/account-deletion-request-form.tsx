"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import { accountDeletionRequestSchema } from "@/lib/validation/auth";

type AccountDeletionSuccessResponse = ApiSuccess<{ message: string }>;
type AccountDeletionErrorResponse = ApiError;
type AccountDeletionResponse = AccountDeletionSuccessResponse | AccountDeletionErrorResponse;

type AccountDeletionValues = {
  confirmationText: string;
  reason: string;
};

const initialValues: AccountDeletionValues = {
  confirmationText: "",
  reason: ""
};

export function AccountDeletionRequestForm() {
  const [values, setValues] = useState<AccountDeletionValues>(initialValues);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function openConfirmation() {
    setIsConfirming(true);
    setGeneralError(null);
    setSuccessMessage(null);
    setFieldErrors({});
    setValues(initialValues);
  }

  function cancelConfirmation() {
    setIsConfirming(false);
    setValues(initialValues);
    setFieldErrors({});
    setGeneralError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    const parsed = accountDeletionRequestSchema.safeParse({
      confirmationText: values.confirmationText,
      reason: values.reason.trim().length > 0 ? values.reason : undefined
    });

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/account-deletion-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed.data)
      });

      const result = (await response.json()) as AccountDeletionResponse;
      if (!result.ok) {
        setGeneralError(result.error.message);
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        }
        return;
      }

      setSuccessMessage(result.data.message);
      setIsConfirming(false);
      setValues(initialValues);
    } catch {
      setGeneralError("Unable to submit account deletion request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-md border border-rose-800/70 bg-rose-950/30 p-4">
      <h2 className="text-base font-semibold text-rose-100">Account Deletion</h2>
      <p className="mt-2 text-sm text-rose-200/90">
        Request account deletion for your candidate profile. This submits a pending
        request and does not immediately remove your data.
      </p>

      {successMessage ? (
        <p className="mt-3 text-sm text-emerald-300" role="status">
          {successMessage}
        </p>
      ) : null}

      {!isConfirming ? (
        <Button
          className="mt-4 border border-rose-700 bg-rose-700/20 text-rose-100 hover:bg-rose-700/30"
          onClick={openConfirmation}
          type="button"
          variant="outline"
          data-testid="request-account-deletion"
        >
          Request Account Deletion
        </Button>
      ) : (
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <p className="text-sm text-rose-200">
            Confirm by typing <span className="font-semibold">DELETE</span>.
          </p>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-200"
              htmlFor="account-deletion-confirmation"
            >
              Type DELETE to confirm
            </label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
              id="account-deletion-confirmation"
              name="confirmationText"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  confirmationText: event.target.value
                }))
              }
              value={values.confirmationText}
              disabled={isSubmitting}
            />
            {fieldErrors.confirmationText?.[0] ? (
              <p className="text-xs text-rose-300">{fieldErrors.confirmationText[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="account-deletion-reason">
              Reason (optional)
            </label>
            <textarea
              className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
              id="account-deletion-reason"
              name="reason"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  reason: event.target.value
                }))
              }
              value={values.reason}
              disabled={isSubmitting}
            />
            {fieldErrors.reason?.[0] ? (
              <p className="text-xs text-rose-300">{fieldErrors.reason[0]}</p>
            ) : null}
          </div>

          {generalError ? <p className="text-sm text-rose-300">{generalError}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="outline"
              className="border border-rose-700 bg-rose-700/20 text-rose-100 hover:bg-rose-700/30"
              disabled={isSubmitting}
              data-testid="confirm-account-deletion"
            >
              {isSubmitting ? "Submitting..." : "Confirm Deletion Request"}
            </Button>
            <Button type="button" variant="secondary" onClick={cancelConfirmation} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
