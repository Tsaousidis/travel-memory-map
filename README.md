# Travel Memory Map

A personal, interactive map of your travels and memories.

## Status

In development with Next.js, TypeScript, Tailwind CSS, and Supabase.
Authentication, owner-based database access, a responsive application shell,
and fictional seed data are implemented. Map, Trips, and Dashboard currently
show placeholders. Deployment is outside the current scope.

## Local development

Use Node.js 24 LTS and npm 11. Install dependencies with `npm ci` and copy
`.env.example` to `.env.local`.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for
your Supabase project. Use a publishable key, never an administrative key.
`APP_URL` defaults to `http://localhost:3000`; configure the same Site URL in
Supabase Auth and allow `http://localhost:3000/auth/callback` as a redirect URL.
Keep the default confirmation email template and open its link in the browser
used for signup. Local environment files are ignored by Git.

On a fresh Supabase database, apply the SQL files in `supabase/migrations` in
filename order, once each. Existing configured projects do not need reapplying.
SQL Editor execution does not update CLI migration history; reconcile that
history before adopting CLI migration commands.

The optional [seed](supabase/seed.sql) contains five trips, nine cities, and
fourteen places. Replace its user-ID placeholder in an SQL Editor copy with an
existing Auth user's UID. Re-running preserves existing records. Photos and
Storage are not implemented yet.

```sh
npm run check:supabase
npm run dev
```

Open http://localhost:3000. The root previews shared UI components; `/app` is
the protected application. On PowerShell, use `npm.cmd` if `npm.ps1` is blocked.

## Architecture

Routes compose domain features and shared components. See
[architecture and conventions](docs/architecture.md) and the
[design system](docs/design-system.md).

The database contains profiles, countries, cities, trips, trip-city associations,
places, and photo records. Cities can be reused across trips; places represent
visits within a specific trip. RLS restricts private records to their owner,
while countries are read-only shared reference data. Composite foreign keys
enforce ownership across related records. Photo records store object paths;
future Storage cleanup must be coordinated separately from database cascades.

## Verification

```sh
npm run lint
npm run typecheck
npm run test:db
npx playwright install chromium
npm run test:auth
npm run build
```

Database tests use PGlite and the actual migrations. Browser tests use isolated
mock services on ports 54329 and 3101, without real accounts or email delivery.
Do not run the production build concurrently with browser tests. An existing
Chromium installation can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

## Known limitations

Hosted password login is verified; automatic sign-in through the hosted email
confirmation callback still needs verification. Local mock tests do not replace
that check. An October 2026 audit also identified a `braces` advisory in the
ESLint dependency chain; dependency remediation remains pending.
