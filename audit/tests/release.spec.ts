import { expect, test } from "@playwright/test";

test.describe("release reviewer path", () => {
  test("keeps the desktop split workspace", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.locator(".pane-left")).toBeVisible();
    await expect(page.locator(".pane-right")).toBeVisible();
  });

  test("fits mobile and makes controls and scene reachable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.locator(".pane-left")).toBeVisible();
    await expect(page.locator(".pane-right")).toBeHidden();

    await page.getByRole("button", { name: "3D scene" }).click();
    await expect(page.locator(".pane-left")).toBeHidden();
    await expect(page.locator(".pane-right")).toBeVisible();
  });
});
