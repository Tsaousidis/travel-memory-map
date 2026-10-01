# Row Level Security — Step 7

## Access model

| Data | Anonymous | Signed-in owner | Other signed-in user |
| --- | --- | --- | --- |
| Countries | No access | Read only | Read only |
| Profiles | No access | Select/insert/update/delete own profile | No access |
| Cities, trips, trip cities, places, photos | No access | Select/insert/update/delete own rows | No access |

The migration grants only CRUD on private tables and SELECT on countries to
`authenticated`. It does not grant TRUNCATE, REFERENCES, or TRIGGER. The Step 6
RLS flags and revocations remain in effect. No policies target `anon` or PUBLIC.

Each private table has four explicit operation policies. `profiles.id` identifies
its owner; other tables use `user_id`. SELECT/DELETE use an ownership predicate;
INSERT uses WITH CHECK; UPDATE uses both USING and WITH CHECK. The latter checks
both the existing row and the proposed owner, blocking ownership transfer.
All predicates use `(select auth.uid())`; a missing identity cannot match.

Composite foreign keys from Step 6 prevent owner-scoped rows from linking to
another owner's trip, city, or place. Policies do not recursively query parent
tables and require no SECURITY DEFINER functions. Existing owner indexes support
filtering. Countries are shared reference data but cannot be edited by clients.

These policies protect database rows. Storage access is a later step; deleting
photo metadata alone will not remove a future Storage object. Deleting a profile
cascades owned records but does not delete the Auth account; any future account
deletion workflow must coordinate Auth, Storage, and database cleanup.

Database owners and privileged server roles can bypass RLS. Keep the public
publishable key in the application and use verified user sessions in Step 8.
Never substitute an administrative key to make a blocked client query succeed.

## Apply to the hosted project

Local tests passed. The project owner applied the migration and shared the hosted
catalog results on 2026-10-02: all seven tables have RLS enabled, countries has
one policy, and each private table has four. Anonymous access and authenticated
TRUNCATE are denied; authenticated writes are denied on countries. These results
match the expected grants and policy counts. Real signed-in API verification
remains part of Step 8.

The following instructions are for applying the migration to another environment;
do not rerun it on the already configured project. Application requires SQL Editor
access; the publishable key cannot execute migrations.

1. Open **travel-memory-map → SQL Editor → New query**.
2. Run the entire file
   `supabase/migrations/20261002000000_travel_rls_policies.sql` once.
   Step 6 must already be applied. Do not rerun the initial schema migration.
3. Run this read-only check:

```sql
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       (select count(*) from pg_policies p
        where p.schemaname = 'public' and p.tablename = c.relname) as policies,
       has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') as anon_access,
       has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_read,
       has_table_privilege('authenticated', c.oid, 'INSERT,UPDATE,DELETE') as authenticated_write,
       has_table_privilege('authenticated', c.oid, 'TRUNCATE') as authenticated_truncate
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
  and c.relname in ('countries','profiles','cities','trips','trip_cities','places','photos')
order by c.relname;
```

Expect seven rows: RLS true, anon_access false, authenticated_read true,
authenticated_truncate false. Countries has **1 policy** and authenticated_write
false. Each of the six private tables has **4 policies** and authenticated_write
true. Privilege flags describe table grants; RLS still limits the rows accessible
under those grants. To inspect the actual predicates:

```sql
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('countries','profiles','cities','trips','trip_cities','places','photos')
order by tablename, cmd;
```

Expect 25 policies, all scoped to `authenticated`. No standalone disposable
verification file is required. Compare the result when setting up a new environment.
If applying migrations manually, follow the CLI history guidance in
[database.md](database.md) when adopting the CLI; this version is `20261002000000`.

## Automated verification and limits

`npm run test:db` runs both the original Step 6 schema tests and the Step 7 RLS
tests in separate in-memory databases. The RLS suite applies both exact migration
files, inserts fictional fixtures as the database owner, then **switches to
anon/authenticated roles** for every access assertion. Transactions roll back all
test changes. No hosted records or credentials are used.

Tests cover owner CRUD, cross-user reads/updates/deletes, forged ownership on
insert, ownership transfer, absent identity, anonymous CRUD, country read-only
access, forbidden truncation, foreign ownership in parent references, and trip
deletion isolation. Both owners exercise successful CRUD.

The test `auth.uid()` reads a transaction-local identity fixture. It models the
database identity contract, not JWT verification. Hosted catalog checks confirm
application of the policies, while real two-session Auth/Data API tests belong
to the authentication step. A publishable-key-only request is anonymous and
should remain denied; an empty result as the SQL Editor owner is not an RLS test.

Reference: [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).
