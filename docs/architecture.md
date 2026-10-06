# Frontend architecture and conventions

## Current structure

```text
src/
  app/                       Routes, layouts, metadata, global CSS
    page.tsx                 Public design system preview
    (auth)/                  Login and signup routes
    auth/                    PKCE callback and confirmation error
    app/                     Protected application routes
    layout.tsx               Root document layout
  components/                Shared, domain-independent UI
  features/
    auth/                    Authentication forms, actions, and session checks
    navigation/              Application shell and account controls
    design-system/components/ Component showcase and interactive examples
  lib/                       Shared integrations and configuration
  types/                     Types shared across features
  utils/                     Pure shared helpers
public/                      Public static assets
docs/                        Project documentation
```

Folders reserved for later steps contain a README explaining their purpose.
Authentication routes and a responsive protected application shell are implemented.
Map, Trips, and Dashboard currently show placeholders.

## Responsibilities and dependencies

- `app` handles routing and composes features. Keep business logic out of route
  files; route-level data loading may call feature server modules.
- `features/<feature>` owns its domain UI, validation, hooks, and data access.
  Create subfolders when real code requires them.
- `components` holds shared presentation independent of individual features.
- `lib` holds integration code and configuration, including Supabase clients.
- `utils` contains pure helpers. `types` contains shared type definitions.

Dependencies flow from `app` to features and shared modules. Shared modules must
not import from `app` or features. Features must not import route files. Prefer
composition in routes over coupling features to each other's internals; extract
a shared contract when needed. These are review conventions, not custom lint
enforcement at this stage.

## Naming and imports

- Use kebab-case for folders and files: `trip-card.tsx`, `use-trip-filters.ts`.
- Use PascalCase for components, types, and interfaces: `TripCard`, `Trip`.
- Use camelCase for functions and variables; hooks start with `use`.
- Use UPPER_SNAKE_CASE for module-level fixed constants.
- Use named exports for application modules. Use default exports where Next.js
  requires them, such as route pages and layouts.
- Use `@/*` for imports across folders (`@/` maps to `src/`). Relative imports
  are fine for files in the same folder.
- Import directly from the owning module; avoid catch-all barrel exports.
- Use `import type` for type-only imports. Order imports: external packages,
  internal aliases, relative imports, then styles.
- Write new application code in TypeScript with strict checking. Prefer explicit
  domain types over `any`; keep props beside their component.
- Match existing formatting: two spaces, double quotes, semicolons.

## Server and browser boundaries

Keep pages and layouts as Server Components by default. Add `"use client"` at
the smallest interactive boundary needing hooks, event handlers, or browser APIs.
Future MapLibre rendering belongs behind such a boundary.

Keep server-only integrations separate from browser clients. When server modules
are introduced, guard them with `server-only`; never import them into Client
Components. Pass serializable data across the boundary. Never expose secrets
through public environment variables.

## Private routes

Private screens belong under
`/app` and must verify identity at their server data/action boundary as well as
using the protected layout. The root remains a public UI preview for now.
