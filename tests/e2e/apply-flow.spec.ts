import { expect, test } from "@playwright/test";

test("apply flow reaches review then accepted", async ({ page }) => {
  await page.route("**/api/auth/apply", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          next: "/apply/review"
        }
      })
    });
  });

  await page.goto("/apply");

  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("securepass123");
  await page.getByLabel("Callsign").fill("Ash_01");

  await page.getByRole("button", { name: "Submit Application" }).click();

  await expect(page).toHaveURL(/\/apply\/review$/);
  await expect(
    page.getByRole("heading", { name: "Check your inbox to verify access." })
  ).toBeVisible();

  await page.getByRole("link", { name: "I have verified my email" }).click();
  await expect(page).toHaveURL(/\/apply\/accepted$/);
  await expect(
    page.getByRole("heading", { name: "Application Accepted" })
  ).toBeVisible();
});

test("duplicate registration attempt shows neutral message with recovery links", async ({
  page
}) => {
  await page.route("**/api/auth/apply", async (route) => {
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "EMAIL_ALREADY_IN_USE",
          message: "An account may already exist for this email."
        }
      })
    });
  });

  await page.goto("/apply");

  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("securepass123");
  await page.getByLabel("Callsign").fill("Ash_01");
  await page.getByRole("button", { name: "Submit Application" }).click();

  await expect(page.getByText("An account may already exist for this email.")).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Log In" })).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "Reset Password" })
  ).toBeVisible();
});

test("verification callback success redirects to accepted state", async ({ page }) => {
  await page.goto("/auth/callback?mock=success&type=signup&next=%2Fapply%2Faccepted");

  await expect(page).toHaveURL(/\/apply\/accepted$/);
  await expect(
    page.getByRole("heading", { name: "Application Accepted" })
  ).toBeVisible();
});

test("expired verification callback shows resend verification path", async ({ page }) => {
  await page.route("**/api/auth/verification/resend", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          message: "If the account is eligible, a new verification email has been sent."
        }
      })
    });
  });

  await page.goto("/auth/callback?mock=error&type=signup");
  await expect(page).toHaveURL(/\/apply\/review\?verification=expired$/);
  await expect(page.getByText("Verification link expired.")).toBeVisible();

  await page.getByLabel("Verification email").fill("candidate@example.com");
  await page.getByTestId("resend-verification-submit").click();
  await expect(
    page.getByText("If the account is eligible, a new verification email has been sent.")
  ).toBeVisible();
});
