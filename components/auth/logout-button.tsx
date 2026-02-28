"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  isAuthenticated: boolean;
};

export function LogoutButton({ isAuthenticated }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST"
      });
      const result = (await response.json()) as {
        ok: boolean;
        data?: { next?: string };
      };

      if (result.ok) {
        router.push(result.data?.next ?? "/login");
        return;
      }
    } catch {
      // Ignore and fall through to safe redirect.
    } finally {
      setIsPending(false);
    }

    router.push("/login");
  }

  return (
    <button
      className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-slate-100"
      disabled={isPending}
      onClick={handleLogout}
      type="button"
    >
      {isPending ? "Signing Out..." : "Log Out"}
    </button>
  );
}
