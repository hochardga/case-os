import type { AuthErrorCode } from "@/lib/auth/error-codes";

type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

export type NormalizedAuthError = {
  code: AuthErrorCode;
  message: string;
  status: number;
};

function normalizeSourceError(error: unknown): AuthErrorLike {
  if (!error || typeof error !== "object") {
    return {};
  }

  const maybeError = error as AuthErrorLike;
  return {
    message: maybeError.message,
    code: maybeError.code,
    status: maybeError.status
  };
}

export function mapAuthError(error: unknown): NormalizedAuthError {
  const source = normalizeSourceError(error);
  const message = source.message?.toLowerCase() ?? "";
  const code = source.code?.toLowerCase() ?? "";

  if (
    message.includes("invalid login credentials") ||
    code.includes("invalid_credentials")
  ) {
    return {
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials. Verify your email and password.",
      status: 401
    };
  }

  if (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    code.includes("user_already_exists")
  ) {
    return {
      code: "EMAIL_ALREADY_IN_USE",
      message: "An account already exists for that email.",
      status: 409
    };
  }

  if (message.includes("password should be at least") || code.includes("weak_password")) {
    return {
      code: "WEAK_PASSWORD",
      message: "Password does not meet minimum security requirements.",
      status: 400
    };
  }

  if (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    source.status === 429
  ) {
    return {
      code: "RATE_LIMITED",
      message: "Too many attempts. Please wait and try again.",
      status: 429
    };
  }

  return {
    code: "UNKNOWN",
    message: "Authentication request failed. Please try again.",
    status: 400
  };
}

