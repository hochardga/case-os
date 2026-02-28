import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplyForm } from "@/components/auth/apply-form";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("ApplyForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("shows field-level validation errors for invalid callsign", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<ApplyForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "candidate@example.com" }
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "securepass123" }
    });
    fireEvent.change(screen.getByLabelText("Callsign"), {
      target: { value: "bad callsign" }
    });

    fireEvent.click(screen.getByTestId("apply-submit"));

    expect(
      await screen.findByText(
        "Callsign must be 3-24 characters using letters, numbers, _ or -."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Callsign")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Callsign")).toHaveAttribute(
      "aria-describedby",
      "apply-callsign-error"
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows password requirements before submission", () => {
    render(<ApplyForm />);

    expect(
      screen.getByText("Password requirements: at least 8 characters.")
    ).toBeInTheDocument();
  });

  it("disables submit while pending and prevents duplicate submission", async () => {
    let resolveResponse: ((value: Response) => void) | undefined;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<ApplyForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "candidate@example.com" }
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "securepass123" }
    });
    fireEvent.change(screen.getByLabelText("Callsign"), {
      target: { value: "Ash_01" }
    });

    const submitButton = screen.getByTestId("apply-submit");
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Submitting...");

    resolveResponse?.(
      new Response(JSON.stringify({ ok: true, data: { next: "/apply/review" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/apply/review");
    });
  });

  it("shows duplicate-email recovery links when account may already exist", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: "EMAIL_ALREADY_IN_USE",
            message: "An account may already exist for this email."
          }
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ApplyForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "candidate@example.com" }
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "securepass123" }
    });
    fireEvent.change(screen.getByLabelText("Callsign"), {
      target: { value: "Ash_01" }
    });

    fireEvent.click(screen.getByTestId("apply-submit"));

    await waitFor(() => {
      expect(
        screen.getByText("An account may already exist for this email.")
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "Log In" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reset Password" })).toBeInTheDocument();
  });
});
