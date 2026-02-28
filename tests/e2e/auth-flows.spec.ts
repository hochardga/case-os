import { expect, test } from "@playwright/test";

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
          message: "Invalid credentials. Verify your email and password."
        }
      })
    });
  });

  await page.goto("/login");

  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(
    page.getByText("Invalid credentials. Verify your email and password.")
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("archive route redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/archive");
  await expect(page).toHaveURL(/\/login$/);
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

test("logout redirects from archive to login", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "phase1-e2e-user",
      value: "test-user-id:Ash_01",
      url: "http://127.0.0.1:4173"
    }
  ]);

  await page.route("**/api/auth/logout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "set-cookie": "phase1-e2e-user=; Path=/; Max-Age=0"
      },
      body: JSON.stringify({
        ok: true,
        data: {
          next: "/login"
        }
      })
    });
  });

  await page.goto("/archive");

  await page.getByRole("button", { name: "Log Out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

