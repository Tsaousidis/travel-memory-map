# Travel Memory Map

A personal, interactive map of your travels and memories.

## Status

Step 9: responsive application shell with Map, Trips, Dashboard, and account
navigation. See the [shell guide](docs/application-shell.md).
Password login has been verified on the hosted project; automatic email-callback
sign-in remains pending as documented in [authentication](docs/authentication.md).
Owner-based RLS was applied and confirmed on 2026-10-02;
see the [RLS setup guide](docs/row-level-security.md).
The initial schema was applied and verified by the project owner on 2026-10-02;
see the [database setup guide](docs/database.md).
Next.js App Router, TypeScript,
Tailwind CSS, and ESLint are configured. Supabase browser/server clients are added;
schema and policy migrations are in `supabase/migrations`. Travel features
follow in subsequent steps.
Deployment is outside the current scope.

## Architecture

Source code is organized into `app`, `components`, `features`, `lib`, `types`,
and `utils`. See [architecture and conventions](docs/architecture.md) for folder
responsibilities, naming, imports, and server/browser boundaries.

## Local development

Use Node.js 24 LTS and npm 11.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

The home route currently previews the shared UI components. See the
[design system guide](docs/design-system.md) for tokens and component contracts.

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Verification

```sh
npm run lint
npm run typecheck
npm run test:db
npm run build
npm start
```

## Environment files

Copy `.env.example` to `.env.local` if you do not already have a local file.
Configure Supabase using the [setup guide](docs/supabase.md), then run
`npm run check:supabase`. The current homepage runs without these values;
the map configuration defaults to a public demo style.

See [environment setup](docs/environment.md) for variables, validation, and
configuration instructions. Local `.env` files are ignored by Git.
