import type { AuthErrorCode } from "@/lib/auth/error-codes";

type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
  details?: string;
  hint?: string;
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
    status: maybeError.status,
    details: maybeError.details,
    hint: maybeError.hint
  };
}

export function mapAuthError(error: unknown): NormalizedAuthError {
  const source = normalizeSourceError(error);
  const message = [source.message, source.details, source.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const code = source.code?.toLowerCase() ?? "";

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

  if (
    message.includes("invalid login credentials") ||
    code.includes("invalid_credentials")
  ) {
    return {
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
      status: 401
    };
  }

  if (
    message.includes("email not confirmed") ||
    code.includes("email_not_confirmed")
  ) {
    return {
      code: "UNVERIFIED_EMAIL",
      message: "Please verify your email before accessing the Archive.",
      status: 403
    };
  }

  if (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    code.includes("user_already_exists")
  ) {
    return {
      code: "EMAIL_ALREADY_IN_USE",
      message: "An account may already exist for this email.",
      status: 409
    };
  }

  if (
    code === "23505" &&
    (message.includes("callsign") || message.includes("profiles_callsign"))
  ) {
    return {
      code: "CALLSIGN_ALREADY_IN_USE",
      message: "That callsign is already in use.",
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
    message.includes("token") &&
    (message.includes("expired") || message.includes("invalid"))
  ) {
    return {
      code: "TOKEN_INVALID_OR_EXPIRED",
      message: "Reset link expired or invalid.",
      status: 400
    };
  }

  if (
    message.includes("otp expired") ||
    code.includes("otp_expired") ||
    code.includes("token_expired") ||
    code.includes("invalid_token") ||
    code.includes("bad_jwt")
  ) {
    return {
      code: "TOKEN_INVALID_OR_EXPIRED",
      message: "Reset link expired or invalid.",
      status: 400
    };
  }

  if (
    (source.status !== undefined && source.status >= 500) ||
    message.includes("service unavailable") ||
    message.includes("temporarily unavailable") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("fetch failed") ||
    message.includes("network")
  ) {
    return {
      code: "SERVICE_UNAVAILABLE",
      message: "Service temporarily unavailable.",
      status: 503
    };
  }

  return {
    code: "UNKNOWN",
    message: "Authentication request failed. Please try again.",
    status: 400
  };
}
