import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function signIn(page: Page, name = "alice") {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(`${name}@example.test`);
  await page.getByLabel(/^Password/).fill("Fixture-password-123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
}

test("unauthenticated and forged sessions cannot open private routes", async ({ page, context }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login$/);
  await context.addCookies([{ name: "sb-127-auth-token", value: "forged", domain: "127.0.0.1", path: "/" }]);
  await page.goto("/app/private");
  await expect(page).toHaveURL(/\/login$/);
});

test("server validates fields and reports invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await page.getByLabel("Email address").fill("alice@example.test");
  await page.getByLabel(/^Password/).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Unable to sign in" })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("login provisions profile, survives reload, redirects guest routes and logs out", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Welcome, Alice." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Welcome, Alice." })).toBeVisible();
  await page.goto("/signup");
  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login$/);
});

test("signup validates input and requests email confirmation without a session", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Your name").fill("New traveler");
  await page.getByLabel("Email address").fill("new@example.test");
  await page.getByLabel(/^Password/).fill("short");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByText("Use between 8 and 128 characters.")).toBeVisible();
  await page.getByLabel("Your name").fill("New traveler");
  await page.getByLabel("Email address").fill("new@example.test");
  await page.getByLabel(/^Password/).fill("Fixture-password-123");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("confirmation email");
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login$/);
});

test("invalid callback strips secrets and refuses external redirects", async ({ page }) => {
  await page.goto("/auth/callback?code=invalid&next=https://evil.example");
  await expect(page).toHaveURL(/\/auth\/error\?reason=browser-verification$/);
  await expect(page.getByRole("heading")).toContainText("could not sign you in");
  await expect(page.getByText(/could not match this link/)).toBeVisible();
});

test("PKCE callback persists session cookies", async ({ page, context }) => {
  await context.addCookies([{ name: "sb-127-auth-token-code-verifier", value: JSON.stringify("fixture-verifier"), domain: "127.0.0.1", path: "/" }]);
  await page.goto("/auth/callback?code=valid-fixture-code&next=https://evil.example");
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Welcome, Alice." })).toBeVisible();
});

test("signup-created verifier completes the email callback without injected cookies", async ({ page, request }) => {
  await page.goto("/signup");
  await page.getByLabel("Your name").fill("Alice");
  await page.getByLabel("Email address").fill("roundtrip@example.test");
  await page.getByLabel(/^Password/).fill("Fixture-password-123");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("confirmation email");
  const confirmation = await request.get("http://127.0.0.1:54329/__test/confirmation?email=roundtrip@example.test");
  const { callback } = await confirmation.json();
  await page.goto(callback);
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Welcome, Alice." })).toBeVisible();
});

test("expired access token refreshes and persists its replacement", async ({ page }) => {
  await signIn(page, "expired");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Welcome, Alice." })).toBeVisible();
});

test("separate browser sessions show separate profiles", async ({ browser }) => {
  const a = await browser.newContext();
  const b = await browser.newContext();
  try {
    const alice = await a.newPage();
    const bob = await b.newPage();
    await signIn(alice);
    await signIn(bob, "bob");
    await expect(alice.getByRole("heading", { name: "Welcome, Alice." })).toBeVisible();
    await expect(bob.getByRole("heading", { name: "Welcome, Bob." })).toBeVisible();
  } finally { await a.close(); await b.close(); }
});

test("auth responses are private and mobile forms fit", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto("/signup");
  // Next's dev server replaces Cache-Control with no-cache; production is
  // separately checked after build. Proxy's additional headers must survive.
  expect(response?.headers()["cache-control"]).toMatch(/no-cache|no-store/);
  expect(response?.headers()["pragma"]).toBe("no-cache");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByLabel("Email address")).toBeVisible();
});
