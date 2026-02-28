import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";

import { AppShell } from "@/components/app-shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe("AppShell", () => {
  it("renders the shared shell and brand copy for unauthenticated users", () => {
    render(
      <AppShell>
        <div>Child Content</div>
      </AppShell>
    );

    expect(screen.getByText("Ashfall Case Library")).toBeInTheDocument();
    expect(screen.getByText("Ashfall Investigative Collective")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apply" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log In" })).toBeInTheDocument();
  });

  it("hides apply and login links for authenticated users", () => {
    render(
      <AppShell isAuthenticated>
        <div>Child Content</div>
      </AppShell>
    );

    expect(screen.queryByRole("link", { name: "Apply" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Log In" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log Out" })).toBeInTheDocument();
  });
});
