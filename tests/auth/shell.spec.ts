import { expect, test } from "@playwright/test";

test("shell navigation works on desktop and mobile; account disclosure is keyboard accessible", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("alice@example.test");
  await page.getByLabel(/^Password/).fill("Fixture-password-123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    for (const [label, path, heading] of [
      ["Trips", "/app/trips", "Your trips"],
      ["Dashboard", "/app/dashboard", "Your travel story"],
      ["Map", "/app", "Welcome, Alice."],
    ]) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const account = page.getByLabel("Account menu");
    await account.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(account).toBeFocused();
    await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeHidden();
  }
  await page.getByLabel("Account menu").click();
  await page.getByRole("heading", { name: "Your world starts here" }).click();
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeHidden();
});

test("new destinations reject signed-out access", async ({ page }) => {
  for (const path of ["/app/trips", "/app/dashboard"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});
