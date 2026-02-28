import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

describe("ResetPasswordForm accessibility", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("announces invalid email errors with aria-linked messaging", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid" }
    });
    const form = screen.getByTestId("reset-submit").closest("form");
    if (!form) {
      throw new Error("Reset password form element missing.");
    }
    fireEvent.submit(form);

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-describedby",
      "reset-email-error"
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
