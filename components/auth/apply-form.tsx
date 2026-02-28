"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import { applySchema } from "@/lib/validation/auth";

type ApplySuccessResponse = ApiSuccess<{ next: string }>;
type ApplyErrorResponse = ApiError;
type ApplyResponse = ApplySuccessResponse | ApplyErrorResponse;

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
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
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

    const parsedValues = applySchema.safeParse(formValues);
    if (!parsedValues.success) {
      setFieldErrors(parsedValues.error.flatten().fieldErrors);
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
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        }
        return;
      }

      router.push(result.data.next);
    } catch {
      setGeneralError("Application request failed. Please try again.");
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
        <label className="text-sm font-medium text-slate-200" htmlFor="apply-password">
          Password
        </label>
        <input
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          id="apply-password"
          name="password"
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="At least 8 characters"
          type="password"
          value={formValues.password}
          disabled={isSubmitting}
        />
        {fieldErrors.password?.[0] ? (
          <p className="text-xs text-rose-300">{fieldErrors.password[0]}</p>
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
          onChange={(event) => updateField("callsign", event.target.value)}
          placeholder="e.g. Ash_01"
          type="text"
          value={formValues.callsign}
          disabled={isSubmitting}
        />
        {fieldErrors.callsign?.[0] ? (
          <p className="text-xs text-rose-300">{fieldErrors.callsign[0]}</p>
        ) : null}
      </div>

      {generalError ? <p className="text-sm text-rose-300">{generalError}</p> : null}

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
