import type { AuthErrorCode } from "@/lib/auth/error-codes";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ValidationFieldErrors = Record<string, string[] | undefined>;

export type ApiError = {
  ok: false;
  error: {
    code: AuthErrorCode | "VALIDATION_ERROR";
    message: string;
    fieldErrors?: ValidationFieldErrors;
  };
};
