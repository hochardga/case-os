import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import type { ApiError, ApiSuccess, ValidationFieldErrors } from "@/lib/api/contracts";
import type { AuthErrorCode } from "@/lib/auth/error-codes";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      ok: true,
      data
    },
    { status }
  );
}

export function apiError(
  code: AuthErrorCode | "VALIDATION_ERROR",
  message: string,
  status = 400,
  fieldErrors?: ValidationFieldErrors
) {
  const payload: ApiError = {
    ok: false,
    error: {
      code,
      message,
      ...(fieldErrors ? { fieldErrors } : {})
    }
  };

  return NextResponse.json(payload, { status });
}

export function apiValidationError(error: ZodError, message = "Invalid request payload.") {
  const fieldErrors = error.flatten().fieldErrors;
  return apiError("VALIDATION_ERROR", message, 400, fieldErrors);
}

