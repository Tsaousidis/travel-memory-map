# Travel Memory Map

A personal, interactive map of your travels and memories.

## Status

Step 2: frontend structure and code conventions. Next.js App Router, TypeScript,
Tailwind CSS, and ESLint are configured. Travel features and Supabase integration will be
implemented in subsequent steps. Deployment is outside the current scope.

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

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Environment files

Local `.env` files are ignored by Git. A future `.env.example` can be committed
with placeholder values. No environment variables are required for this step.
