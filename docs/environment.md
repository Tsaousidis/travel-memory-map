# Environment configuration

## Local setup

From the project root, create `.env.local` only if it does not already exist:

```powershell
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

For macOS/Linux: `test -f .env.local || cp .env.example .env.local`.
Keep the file beside `package.json`, outside `src/`. Restart the dev server after
editing it. Public values are embedded at build time, so rebuild production
output after changing them.

| Variable | Purpose | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | When using Supabase, starting in Step 5 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project publishable key (`sb_publishable_...`) | When using Supabase, starting in Step 5 |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Absolute HTTP(S) MapLibre style URL | Optional; defaults to the MapLibre demo style |
| `APP_URL` | Server-only app origin for signup callback URLs | Defaults to `http://localhost:3000`; must match Supabase URL Configuration |

The template leaves Supabase values empty. The current homepage and build work
without a Supabase project. Follow the [Supabase setup guide](supabase.md) to fill
in values from the Connect dialog and run the Step 5 connectivity command.

## Using configuration

Import `getSupabaseConfig` or `getMapConfig` directly from
`@/lib/config/public-env`. Both validate when called, rather than during import.
Supabase configuration requires both values and the modern publishable key
format; legacy `anon` JWT keys are intentionally not accepted. URL validation
allows HTTP for local development and HTTPS for hosted services. Errors identify
the variable without printing its value. Validation checks configuration shape,
not whether a remote service or key works.

The map starts at longitude 0, latitude 20, zoom 1.5. The demo style needs no API
key and is a development baseline; it is not the final detailed city/place
basemap. Select that provider during map integration, including attribution and
usage requirements. No map library or network requests are added in this step.

## Public values and Git

Every `NEXT_PUBLIC_` value is visible to the browser. Never put a Supabase secret
key, `service_role` key, database password, or private provider token in these
variables. Publishable keys are designed for public clients; data isolation will
be enforced through Authentication and RLS in their respective steps.

`.env.example` contains only empty values and a public demo URL. `.env.local` and
other `.env` files remain ignored. Do not force-add local environment files.

```sh
git check-ignore .env.local .env.production
git ls-files -- .env.local
```

The first command should list both ignored paths; the second should print nothing.

## References

- [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [MapLibre demo tiles](https://github.com/maplibre/demotiles)
