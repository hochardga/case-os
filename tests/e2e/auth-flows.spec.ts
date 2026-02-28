import { expect, test, type Page } from "@playwright/test";

async function tabUntilFocused(page: Page, label: string) {
  const target = page.getByLabel(label);
  for (let index = 0; index < 30; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }
  }

  throw new Error(`Unable to focus "${label}" via keyboard tab sequence.`);
}

test("login success routes to archive", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "set-cookie": "phase1-e2e-user=test-user-id:Ash_01; Path=/; HttpOnly"
      },
      body: JSON.stringify({
        ok: true,
        data: {
          next: "/archive"
        }
      })
    });
  });

  await page.goto("/login");

  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("securepass123");
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByRole("heading", { name: "Archive Access" })).toBeVisible();
  await expect(page.getByTestId("archive-callsign")).toHaveText("Ash_01");
  const primaryNav = page.getByLabel("Primary");
  await expect(primaryNav.getByRole("link", { name: "Archive" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Candidate File" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Apply" })).toHaveCount(0);
  await expect(primaryNav.getByRole("link", { name: "Log In" })).toHaveCount(0);
});

test("auth entry surfaces expose legal links and account data-use statement", async ({
  page
}) => {
  const routes = ["/apply", "/login", "/reset-password"];
  for (const route of routes) {
    await page.goto(route);
    await expect(
      page.getByText("We store your email and profile information for account management.")
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Statement" })).toHaveAttribute(
      "href",
      "/legal/privacy"
    );
    await expect(page.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/legal/terms"
    );
  }

  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { name: "Privacy Statement" })).toBeVisible();

  await page.goto("/legal/terms");
  await expect(page.getByRole("heading", { name: "Terms" })).toBeVisible();
});

test("keyboard-only login flow remains operable", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "set-cookie": "phase1-e2e-user=test-user-id:Ash_01; Path=/; HttpOnly"
      },
      body: JSON.stringify({
        ok: true,
        data: {
          next: "/archive"
        }
      })
    });
  });

  await page.goto("/login");
  await tabUntilFocused(page, "Email");
  await page.keyboard.type("candidate@example.com");

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Password")).toBeFocused();
  await page.keyboard.type("securepass123");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByRole("heading", { name: "Archive Access" })).toBeVisible();
});

test("invalid login shows sanitized error", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password."
        }
      })
    });
  });

  await page.goto("/login");

  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page.getByText("Invalid email or password.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("repeated login attempts surface rate-limited UX", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/auth/login", async (route) => {
    attempts += 1;

    if (attempts <= 2) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password."
          }
        })
      });
      return;
    }

    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many attempts. Please wait and try again.",
          retryAfterSeconds: 120
        }
      })
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("wrong-password");

  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();

  await page.getByRole("button", { name: "Log In" }).click();
  await expect(
    page.getByText("Too many attempts. Please wait and try again.")
  ).toBeVisible();
});

test("login rate limiting emits auth_rate_limited analytics", async ({ page }) => {
  await page.request.delete("/api/testing/analytics-events");

  const email = `candidate-${Date.now()}@example.com`;
  const payload = {
    email,
    password: "wrong-password"
  };
  const headers = {
    "x-forwarded-for": "198.51.100.42"
  };

  await page.request.post("/api/auth/login", { data: payload, headers });
  const rateLimitedResponse = await page.request.post("/api/auth/login", {
    data: payload,
    headers
  });

  expect(rateLimitedResponse.status()).toBe(429);
  const rateLimitedPayload = (await rateLimitedResponse.json()) as {
    ok: boolean;
    error?: {
      code?: string;
      retryAfterSeconds?: number;
    };
  };
  expect(rateLimitedPayload.ok).toBe(false);
  expect(rateLimitedPayload.error?.code).toBe("RATE_LIMITED");
  expect(rateLimitedPayload.error?.retryAfterSeconds).toBe(120);

  let sawRateLimitedAnalyticsEvent = false;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const response = await page.request.get("/api/testing/analytics-events");
    const result = (await response.json()) as {
      ok: boolean;
      data?: {
        events?: Array<{
          event_name: string;
          action?: string;
          retry_after_seconds?: number;
          phase?: string;
        }>;
      };
    };

    sawRateLimitedAnalyticsEvent = Boolean(
      result.data?.events?.some(
        (event) =>
          event.event_name === "auth_rate_limited" &&
          event.action === "login" &&
          event.retry_after_seconds === 120 &&
          event.phase === "phase-002"
      )
    );

    if (sawRateLimitedAnalyticsEvent) {
      break;
    }

    await page.waitForTimeout(50);
  }

  expect(sawRateLimitedAnalyticsEvent).toBe(true);
});

test("unverified login is blocked with resend verification entry point", async ({
  page
}) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "UNVERIFIED_EMAIL",
          message: "Please verify your email before accessing the Archive."
        }
      })
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("securepass123");
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(
    page.getByText("Please verify your email before accessing the Archive.")
  ).toBeVisible();
  const resendLink = page.getByRole("link", { name: "Resend verification email" });
  await expect(resendLink).toBeVisible();
  await expect(resendLink).toHaveAttribute(
    "href",
    "/apply/review?verification=expired&email=candidate%40example.com"
  );
});

test("password reset request and update flow succeeds", async ({ page }) => {
  await page.route("**/api/auth/reset-password", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          message: "If an account exists for this email, you'll receive reset instructions."
        }
      })
    });
  });

  await page.route("**/api/auth/reset-password/confirm", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          message: "Password updated successfully.",
          next: "/login?reset=success"
        }
      })
    });
  });

  await page.goto("/reset-password");
  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByRole("button", { name: "Request Reset Link" }).click();
  await expect(
    page.getByText("If an account exists for this email, you'll receive reset instructions.")
  ).toBeVisible();

  await page.goto("/auth/callback?mock=success&type=recovery&next=%2Freset-password%2Fupdate");
  await expect(page).toHaveURL(/\/reset-password\/update$/);

  await page.getByLabel("New password").fill("securepass123");
  await page.getByLabel("Confirm password").fill("securepass123");
  await page.getByRole("button", { name: "Update Password" }).click();

  await expect(page).toHaveURL(/\/login\?reset=success$/);
  await expect(page.getByText("Password updated successfully.")).toBeVisible();
});

test("repeated reset requests surface rate-limited UX", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/auth/reset-password", async (route) => {
    attempts += 1;

    if (attempts <= 2) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            message: "If an account exists for this email, you'll receive reset instructions."
          }
        })
      });
      return;
    }

    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many attempts. Please wait and try again.",
          retryAfterSeconds: 180
        }
      })
    });
  });

  await page.goto("/reset-password");
  await page.getByLabel("Email").fill("candidate@example.com");

  await page.getByRole("button", { name: "Request Reset Link" }).click();
  await expect(
    page.getByText("If an account exists for this email, you'll receive reset instructions.")
  ).toBeVisible();

  await page.getByRole("button", { name: "Request Reset Link" }).click();
  await expect(
    page.getByText("If an account exists for this email, you'll receive reset instructions.")
  ).toBeVisible();

  await page.getByRole("button", { name: "Request Reset Link" }).click();
  await expect(
    page.getByText("Too many attempts. Please wait and try again.")
  ).toBeVisible();
});

test("expired recovery link routes to reset request with clear retry CTA", async ({
  page
}) => {
  await page.goto("/auth/callback?mock=error&type=recovery");

  await expect(page).toHaveURL(/\/reset-password\?auth_error=link_invalid$/);
  await expect(page.getByText("Reset link expired or invalid.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Request new reset link" })).toBeVisible();
});

test("archive route redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/archive");
  await expect(page).toHaveURL(/\/login\?next=%2Farchive$/);
});

test("candidate file route redirects to login when unauthenticated", async ({
  page
}) => {
  await page.goto("/candidate-file");
  await expect(page).toHaveURL(/\/login\?next=%2Fcandidate-file$/);
});

test("login preserves safe next destination from query params", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    const payload = route.request().postDataJSON() as { next?: string };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "set-cookie": "phase1-e2e-user=test-user-id:Ash_01; Path=/; HttpOnly"
      },
      body: JSON.stringify({
        ok: true,
        data: {
          next: payload.next ?? "/archive"
        }
      })
    });
  });

  await page.goto("/login?next=%2Farchive%3Fview%3Dresume");
  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("securepass123");
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(/\/archive\?view=resume$/);
  await expect(page.getByRole("heading", { name: "Archive Access" })).toBeVisible();
});

test("archive route renders callsign when authenticated", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "phase1-e2e-user",
      value: "test-user-id:Ash_01",
      url: "http://127.0.0.1:4173"
    }
  ]);

  await page.goto("/archive");

  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByTestId("archive-callsign")).toHaveText("Ash_01");
});

test("authenticated home redirects to archive", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "phase1-e2e-user",
      value: "test-user-id:Ash_01",
      url: "http://127.0.0.1:4173"
    }
  ]);

  await page.goto("/");

  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByRole("heading", { name: "Archive Access" })).toBeVisible();
});

test("authenticated candidate file can submit account deletion request", async ({
  page,
  context
}) => {
  await context.addCookies([
    {
      name: "phase1-e2e-user",
      value: "test-user-id:Ash_01",
      url: "http://127.0.0.1:4173"
    }
  ]);

  await page.route("**/api/auth/account-deletion-request", async (route) => {
    const payload = route.request().postDataJSON() as {
      confirmationText: string;
      reason?: string;
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          message: "Account deletion request received."
        }
      })
    });

    expect(payload.confirmationText).toBe("DELETE");
    expect(payload.reason).toBe("No longer using this account.");
  });

  await page.goto("/candidate-file");
  await expect(page).toHaveURL(/\/candidate-file$/);
  await expect(page.getByRole("heading", { name: "Candidate File" })).toBeVisible();
  await expect(page.getByTestId("candidate-file-callsign")).toHaveText("Ash_01");

  await page.getByTestId("request-account-deletion").click();
  await expect(page.getByText("Confirm by typing DELETE.")).toBeVisible();
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page.getByLabel("Reason (optional)").fill("No longer using this account.");
  await page.getByTestId("confirm-account-deletion").click();

  await expect(page.getByText("Account deletion request received.")).toBeVisible();
});

test("logout redirects to public landing and back button cannot reveal archive", async ({
  page
}) => {
  await page.context().addCookies([
    {
      name: "phase1-e2e-user",
      value: "test-user-id:Ash_01",
      url: "http://127.0.0.1:4173"
    }
  ]);

  await page.route("**/api/auth/logout", async (route) => {
    await page.context().clearCookies();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "set-cookie": "phase1-e2e-user=; Path=/; Max-Age=0"
      },
      body: JSON.stringify({
        ok: true,
        data: {
          next: "/"
        }
      })
    });
  });

  await page.goto("/archive");

  await page.getByRole("button", { name: "Log Out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Welcome to the Ashfall Case Library" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Log Out" })).toHaveCount(0);
  await expect(
    page.getByLabel("Primary").getByRole("link", { name: "Log In" })
  ).toBeVisible();

  await page.goBack();
  await expect(page).not.toHaveURL(/\/archive$/);
  await expect(page.getByRole("heading", { name: "Archive Access" })).toHaveCount(0);

  await page.goto("/archive");
  await expect(page).toHaveURL(/\/login\?next=%2Farchive$/);
});

test("expired session on archive redirects with session-expired login state", async ({
  page,
  context
}) => {
  await context.addCookies([
    {
      name: "sb-e2e-auth-token",
      value: "expired-token",
      url: "http://127.0.0.1:4173"
    }
  ]);

  await page.goto("/archive");

  await expect(page).toHaveURL(/\/login\?next=%2Farchive&session=expired$/);
  await expect(
    page.getByText("Your session has expired. Please log in again.")
  ).toBeVisible();
});
