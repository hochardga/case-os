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
    expect(fetchMock).not.toHaveBeenCalled();
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
});

