export const AUTH_ERROR_CODES = [
  "INVALID_CREDENTIALS",
  "EMAIL_ALREADY_IN_USE",
  "WEAK_PASSWORD",
  "RATE_LIMITED",
  "UNKNOWN"
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

