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

  await page.getByRole("link", { name: "Continue to Acceptance" }).click();
  await expect(page).toHaveURL(/\/apply\/accepted$/);
  await expect(
    page.getByRole("heading", { name: "Application Accepted" })
  ).toBeVisible();
});

