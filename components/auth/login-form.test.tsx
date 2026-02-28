import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("LoginForm accessibility", () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("links field errors to controls using aria attributes", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "candidate@example.com" }
    });
    const form = screen.getByTestId("login-submit").closest("form");
    if (!form) {
      throw new Error("Login form element missing.");
    }
    fireEvent.submit(form);

    expect(await screen.findByText("Password is required.")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "aria-describedby",
      "login-password-error"
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
