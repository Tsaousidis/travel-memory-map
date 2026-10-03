# Supabase setup (Step 5)

## Create and configure the project

1. Sign in at https://supabase.com/dashboard and create `travel-memory-map` in
   your organization. Choose the plan and region appropriate for your account.
2. Generate and securely store the database password. The frontend does not need
   it; do not place it in public environment variables or commit it.
3. Wait for provisioning, then copy the project URL and publishable key from the
   Connect dialog into this project's `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Use a separate project from other applications. Keep the map configuration.
Never use a secret/service_role key in these fields. Restart Next.js after edits;
rebuild production output when public values change.

## Verify the connection

```sh
npm run check:supabase
```

Requires Node.js 24 as documented in the README. The command loads `.env.local`,
validates the configuration, then makes read-only requests to Auth settings and
the Data API using the publishable key. The Data API request targets a deliberately
absent diagnostic table with `limit=0`; HTTP 404 with code `PGRST205` is the
expected response proving that the request reached PostgREST. Other errors fail.
The OpenAPI root is not used because it restricts publishable keys.
The command prints only status,
not keys, URLs, or remote response bodies. It exits nonzero on missing values,
timeouts, rejected keys, disabled services, or unexpected responses.

Auth must report connected and Data API reachable. This proves reachability and key acceptance,
not schema correctness, user authentication, RLS, or Storage policies. Tables and
policies are Steps 6–7; authentication is Step 8. No sample tables are needed.

## Application clients

- Client Components: import `createClient` from `@/lib/supabase/client`.
  The SSR package manages browser cookies and browser client reuse.
- Server Components, Server Actions, Route Handlers: await `createClient` from
  `@/lib/supabase/server`. It reads request cookies and creates a fresh client
  per invocation. Never store this client in module-global state.

Both clients use `getSupabaseConfig()` and the public key. The server module is
guarded with `server-only`. Database generics will be added with generated schema
types after Step 6; do not invent table types now.

Authentication, protected routes, and the session refresh proxy are implemented
in Step 8. Follow [authentication setup](authentication.md) for email redirects
and live verification. Server Components cannot persist refreshed cookies; the
proxy handles these before rendering. Server actions and callback handlers write
their own outgoing cookies. Do not treat an unverified session as authorization.

The UI preview does not call these clients; it still builds with empty Supabase
values while the external project is being configured.

Reference: [Supabase SSR client setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).
