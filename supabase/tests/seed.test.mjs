import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { before, after, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const users = [randomUUID(), randomUUID()];
const existingCity = randomUUID();
const seed = await readFile(new URL("../seed.sql", import.meta.url), "utf8");
const runSeed = (user) => db.exec(seed.replace("REPLACE_WITH_AUTH_USER_ID", user));

before(async () => {
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key);
    create role anon;
    create role authenticated;
    grant usage on schema public, auth to anon, authenticated;
    create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `);
  for (const file of ["20261001000000_initial_travel_schema.sql", "20261002000000_travel_rls_policies.sql"]) {
    await db.exec(await readFile(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  }
  for (const user of users) await db.query("insert into auth.users values ($1)", [user]);
  await db.exec("insert into public.countries values ('JP','Japan','AS')");
  await db.query("insert into public.profiles (id,display_name) values ($1,'Existing name')", [users[0]]);
  await db.query("insert into public.cities (id,user_id,country_code,name,latitude,longitude) values ($1,$2,'JP',' tokyo ',35,139)", [existingCity, users[0]]);
  for (const user of users) await runSeed(user);
});
after(async () => { await db.close(); });

test("seed creates complete journeys and reuses Tokyo across two trips", async () => {
  for (const user of users) {
    for (const [table, count] of Object.entries({ trips: 5, cities: 9, trip_cities: 10, places: 14, photos: 0 })) {
      assert.equal((await db.query(`select count(*)::int as n from public.${table} where user_id=$1`, [user])).rows[0].n, count);
    }
  }
  assert.equal((await db.query("select count(*)::int as n from public.trip_cities where city_id=$1", [existingCity])).rows[0].n, 2);
  assert.equal((await db.query("select count(*)::int as n from public.places p join public.trips t on t.id=p.trip_id where p.visited_on not between t.start_date and t.end_date")).rows[0].n, 0);
  assert.equal((await db.query("select count(*)::int as n from public.countries")).rows[0].n, 4);
  assert.equal((await db.query("select count(*)::int as n from public.trips where cover_photo_id is not null")).rows[0].n, 0);
});

test("rerunning preserves IDs, edits, profiles and existing cities without duplicates", async () => {
  await db.query("update public.trips set notes='My edited note' where user_id=$1", [users[0]]);
  await db.query("update public.places set notes='My edited place' where user_id=$1", [users[0]]);
  async function snapshot() {
    const result = {};
    for (const table of ["countries", "profiles", "cities", "trips", "trip_cities", "places", "photos"]) {
      result[table] = (await db.query(`select * from public.${table} order by ${table === "countries" ? "code" : "id"}`)).rows;
    }
    return result;
  }
  const previous = await snapshot();
  for (const user of users) await runSeed(user);
  assert.deepEqual(await snapshot(), previous);
  assert.equal((await db.query("select display_name from public.profiles where id=$1", [users[0]])).rows[0].display_name, "Existing name");
});

test("seed rejects a missing user without inserting any data", async () => {
  const missing = randomUUID();
  await assert.rejects(runSeed(missing), /existing Auth user/);
  assert.equal((await db.query("select count(*)::int as n from public.profiles where id=$1", [missing])).rows[0].n, 0);
});

test("an error mid-seed rolls back profile and all travel rows", async () => {
  const user = randomUUID();
  await db.query("insert into auth.users values ($1)", [user]);
  const broken = seed.replace("REPLACE_WITH_AUTH_USER_ID", user).replace('"category": "museum"', '"category": "invalid-category"');
  await assert.rejects(db.exec(broken), (error) => error.code === "23514");
  for (const table of ["profiles", "cities", "trips", "trip_cities", "places"]) {
    assert.equal((await db.query(`select count(*)::int as n from public.${table} where ${table === "profiles" ? "id" : "user_id"}=$1`, [user])).rows[0].n, 0);
  }
});

test("seeded memories remain isolated by the real RLS policies", async () => {
  for (const user of users) {
    await db.exec("begin");
    try {
      await db.query("select set_config('request.jwt.claim.sub',$1,true)", [user]);
      await db.exec("set local role authenticated");
      for (const [table, count] of Object.entries({ trips: 5, cities: 9, trip_cities: 10, places: 14 })) {
        const rows = (await db.query(`select user_id from public.${table}`)).rows;
        assert.equal(rows.length, count);
        assert.ok(rows.every((row) => row.user_id === user));
      }
    } finally {
      await db.exec("rollback");
    }
  }
});
