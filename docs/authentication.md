# Authentication — Step 8

## Routes and behavior

- `/login`: email/password sign-in with server validation and generic errors.
- `/signup`: name, email, and password registration. Confirmation-enabled projects
  show a generic email notice; confirmation-disabled projects sign in immediately.
- `/auth/callback`: PKCE code exchange, then a fixed redirect to `/app`.
- `/auth/error`: missing, expired, reused, or cross-browser confirmation links.
- `/app`: minimal protected landing page and logout, preceding the Step 9 shell.
- `/`: public design-system preview with a sign-in link.

Passwords are neither trimmed nor returned in action state. Signup requires
8–128 characters; Supabase may enforce stronger server-side password rules.
Email and name lengths are limited. Forms show pending, field errors, and
accessible status messages. Provider messages and authorization codes are not
rendered back to users. Login errors do not identify whether an account exists.
Supabase Auth supplies provider-side rate limits; the application does not add
an in-memory limiter that would be unreliable across multiple server processes.

## Dashboard configuration and live verification

In **Authentication → URL Configuration**, use:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

Keep **Confirm email** enabled and retain the default confirmation email link
using `{{ .ConfirmationURL }}`. This flow uses the default PKCE callback, not a
custom token-hash email template. `APP_URL` in `.env.local` must match that origin
(defaults to localhost:3000). Use the same hostname and port to start signup and
open the email. In PKCE, the originating browser holds a verifier cookie.
Another browser or a cleared verifier cannot complete that exchange; after email
verification the user can try password sign-in in the desired browser.

The hosted email service may limit recipients/delivery without custom SMTP.
Do not disable email confirmation to disguise a delivery failure; configure
delivery in Supabase if needed. The app's generic notice cannot prove delivery.

Run the app, then verify manually with accounts you control:

1. Visit `/app` while signed out; expect `/login`.
2. Create an account at `/signup`, open the email in the same browser, and confirm
   that `/app` welcomes you. A single `profiles` record should appear for that
   verified Auth user. Do not share passwords or email confirmation links.
3. Reload and navigate to `/login`; the session persists and redirects to `/app`.
4. Sign out; `/app` must redirect back to `/login`. Test invalid credentials.
5. Use a separate browser context for a second account. Check separate profiles
   and verify owner access through real authenticated Data API requests when
   completing hosted RLS verification. Never test RLS as the SQL Editor owner.

Local fixture tests do not replace this hosted email/Auth/RLS verification.
No SQL migration or service-role key is required for this step.

Hosted check reported on 2026-10-03: the user received the confirmation email;
automatic callback sign-in showed the error screen, but subsequent password
sign-in reached `/app`. This confirms email verification and password login, not
a successful hosted callback exchange. Its original cause was not captured.
The error screen now distinguishes missing code, missing/mismatched browser
verifier, rejected exchange, and temporary service failure without exposing
tokens or provider messages. A full signup-to-callback test now uses the actual
signup cookies and checks the PKCE challenge, rather than injecting a verifier.

## Sessions and profiles

The Next.js proxy refreshes sessions and sets cookies on both the forwarded
request and returned response. Auth responses and redirects are marked private,
no-store, no-cache, and no-referrer. Refreshed cookies survive redirects.
The proxy uses `getUser()` to verify the session with Auth, including account
revocation; protected server data access independently calls `requireUser()`.
Request-scoped React `cache` deduplicates identity checks without sharing users.
RLS remains the database authorization boundary.

`getOwnProfile()` checks the verified user's profile and provisions one through
the existing owner-only INSERT policy when absent. Duplicate requests use an
ignore-duplicates upsert, so names are not overwritten. User metadata is only
used as an optional bounded display name, never for permissions. Existing rows
are preserved. Provisioning failures show a retry/sign-out screen instead of
pretending authentication failed or creating a new Auth account.

Logout is a POST Server Action with Supabase's `local` scope (this session), then
revalidates the layout and redirects. Provider failure shows an error instead
of claiming success. No open `next` URL is accepted. Next.js Server Action origin
checks remain enabled; credentials/logout are not implemented as GET endpoints.
Auth callback cookies are written through Next.js's outgoing cookie store.

Future mutations must verify identity inside the action; a layout alone is not
authorization. Any new private routes must live under `/app` or explicitly join
the proxy matcher and use the same server-side access checks.

## Automated checks

```sh
npx playwright install chromium
npm run test:auth
npm run test:db
```

Playwright starts an isolated mock Auth/Data API at 127.0.0.1:54329 and a Next.js
test server at 127.0.0.1:3101. It overrides environment variables only for that
process; `.env.local` is untouched. It never sends emails or uses real accounts.
Test compilation uses `.next/auth-test` so an existing local dev server can keep
running. Do not run a production build concurrently, as it replaces `.next`.
Ports must be free. The fixture checks application orchestration and SDK cookie
behavior, not production JWT verification or actual Supabase RLS. PostgreSQL
RLS behavior is covered separately by the database tests.

On the Windows environment where native SWC is blocked, set the local WASM
override from [design-system.md](design-system.md) before testing. Optionally
set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an already installed Chromium executable.
Browser traces and test reports are ignored by Git.

Verification on 2026-10-03: 9 browser tests, 57 database tests, lint, TypeScript,
and the standard Turbopack production build passed. Native SWC worked again in
this session, so the older WASM workaround was not needed for the final build.
On the restricted Windows sandbox, Playwright teardown required running the
test command outside the sandbox to stop its own child servers cleanly.

## Known tooling finding

On 2026-10-03, npm audit reported a high-severity `braces` recursion/denial-of-service
advisory through the ESLint dependency chain (five affected package entries).
It is development tooling, not an Auth runtime dependency. The suggested forced
fix downgrades `eslint-config-next` across major versions and was not applied.
Recheck upstream fixes during Step 32; do not claim a clean full dependency audit.

References: [Supabase Next.js tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs),
[SSR cache handling](https://supabase.com/docs/guides/auth/server-side/advanced-guide).
