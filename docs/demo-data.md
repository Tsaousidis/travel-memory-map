# Development seed — Step 10

[`supabase/seed.sql`](../supabase/seed.sql) contains fictional journeys and memories
at real destinations, with approximate coordinates. It is an optional development
fixture, separate from schema migrations, and is never loaded automatically by
the app. All private rows belong to one explicitly selected existing Auth user.

| Trip | Dates | Cities | Places |
| --- | --- | --- | --- |
| Japan 2025 | 2025-04-12 – 2025-04-27 | Tokyo, Kyoto, Osaka | 5 |
| Italy 2024 | 2024-06-03 – 2024-06-12 | Rome, Florence | 3 |
| Iceland 2023 | 2023-09-08 – 2023-09-15 | Reykjavik, Vik | 2 |
| Portugal 2022 | 2022-05-14 – 2022-05-21 | Lisbon, Porto | 2 |
| Tokyo revisited 2026 | 2026-03-05 – 2026-03-09 | Tokyo | 2 |

A fresh account receives 5 trips, 9 reusable cities, 10 trip-city associations,
and 14 places across 4 countries and 2 continents. Tokyo is reused by two trips;
Shibuya Sky has a separate visit and memory in each. Country reference data only
covers these four destinations for now, not the complete world country catalog.
Notes explicitly identify themselves as demo memories.

## Apply to your development project

1. Apply both existing schema and RLS migrations first.
2. In Supabase **Authentication → Users**, copy the UID of the account you use
   to sign in. The script does not create Auth accounts or change credentials.
3. Copy `supabase/seed.sql` into a new **SQL Editor** query. Replace
   `REPLACE_WITH_AUTH_USER_ID` with that UID **in the editor copy**. Keep the
   surrounding single quotes. Leave the repository file with its placeholder.
4. Run the entire query using the SQL Editor's administrative role. An absent
   or invalid UID produces an error without inserting data. A missing profile
   for a valid Auth user is created; an existing profile is preserved.
5. Run the verification query below with the same UID. Expected counts apply
   to an otherwise empty account; pre-existing records increase the totals.

```sql
with target as (select 'REPLACE_WITH_AUTH_USER_ID'::uuid as id)
select
  (select count(*) from public.trips where user_id = target.id) as trips,
  (select count(*) from public.cities where user_id = target.id) as cities,
  (select count(*) from public.trip_cities where user_id = target.id) as trip_cities,
  (select count(*) from public.places where user_id = target.id) as places,
  (select count(*) from public.photos where user_id = target.id) as photos
from target;
-- Fresh account: 5 | 9 | 10 | 14 | 0
```

The application still shows the Step 9 placeholders. Map rendering and travel
screens come in later steps; this step prepares their database content.
No photo records or cover URLs are invented. Sample files and private Storage
objects will be added when the Storage and upload steps are implemented.

## Re-running and ownership

The single DO statement is atomic. It changes no schema, grants, or RLS policies.
It uses deterministic IDs scoped to the owner and fixture version. Re-running
does not overwrite existing trip/place notes, dates, titles, city coordinates,
profiles, or country reference records. Matching cities are reused by normalized
name, country, and empty region, including cities created before the seed.
Two users receive independent travel rows; country references are shared.

This is an additive seed, not a reset or synchronization command. Deleted fixture
rows can be recreated. Renaming a city or changing its region can prevent a match
and cause the seed to fail atomically; use a fresh demo account for a pristine
dataset. There is deliberately no broad delete/reset command for an account that
may later contain personal memories.

## Verification

`npm run test:db` executes this exact seed against both migrations in PGlite.
Tests cover counts and date relationships, repeated visits, reuse of a pre-existing
city, preserving edits on repeat runs, missing users, rollback after a mid-seed
constraint failure, and owner isolation under the actual authenticated RLS role.
No hosted credentials or network access are used by these tests. Running the seed
on the hosted project is a separate manual setup step.
