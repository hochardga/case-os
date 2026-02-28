import { sanitizeNextPath } from "@/lib/auth/redirects";

type CallbackType = "signup" | "recovery" | "unknown";

function normalizeCallbackType(type: string | null): CallbackType {
  if (type === "signup") {
    return "signup";
  }

  if (type === "recovery") {
    return "recovery";
  }

  return "unknown";
}

function successFallbackForType(type: CallbackType) {
  if (type === "recovery") {
    return "/reset-password/update";
  }

  return "/apply/accepted";
}

export function resolveCallbackSuccessRedirect(next: string | null, type: string | null) {
  const callbackType = normalizeCallbackType(type);
  const fallback = successFallbackForType(callbackType);

  return sanitizeNextPath(next, fallback);
}

export function resolveCallbackFailureRedirect(type: string | null) {
  const callbackType = normalizeCallbackType(type);
  if (callbackType === "recovery") {
    return "/reset-password?auth_error=link_invalid";
  }

  return "/apply/review?verification=expired";
}

export function resolveCallbackRedirect(options: {
  next: string | null;
  type: string | null;
  wasSuccessful: boolean;
}) {
  if (options.wasSuccessful) {
    return resolveCallbackSuccessRedirect(options.next, options.type);
  }

  return resolveCallbackFailureRedirect(options.type);
}
