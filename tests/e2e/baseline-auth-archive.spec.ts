import { expect, test } from "@playwright/test";

test("signup then login reaches archive and renders callsign", async ({ page }) => {
  const callsign = "Ash_T9";

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

  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "set-cookie": `phase1-e2e-user=test-user-id:${callsign}; Path=/; HttpOnly`
      },
      body: JSON.stringify({
        ok: true,
        data: {
          next: "/archive"
        }
      })
    });
  });

  await page.goto("/apply");

  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("securepass123");
  await page.getByLabel("Callsign").fill(callsign);
  await page.getByTestId("apply-submit").click();

  await expect(page).toHaveURL(/\/apply\/review$/);
  await page.getByRole("link", { name: "I have verified my email" }).click();
  await expect(page).toHaveURL(/\/apply\/accepted$/);
  await page.getByRole("link", { name: "Log In" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByLabel("Password").fill("securepass123");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByTestId("archive-callsign")).toHaveText(callsign);
});
