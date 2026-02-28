"use client";

import { useEffect } from "react";

export function ProtectedPageGuard() {
  useEffect(() => {
    // Prevent BFCache restore so back navigation re-runs server auth guards.
    const onUnload = () => {};
    window.addEventListener("unload", onUnload);

    return () => {
      window.removeEventListener("unload", onUnload);
    };
  }, []);

  return null;
}
