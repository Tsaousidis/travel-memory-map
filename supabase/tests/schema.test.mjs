import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { before, after, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const userA = "00000000-0000-4000-8000-000000000001";
const userB = "00000000-0000-4000-8000-000000000002";
const ids = {};

async function insert(sql, values = []) {
  return (await db.query(`${sql} returning id`, values)).rows[0].id;
}

before(async () => {
  // Minimal Supabase-owned interfaces only. This is not an Auth/Storage emulator.
  await db.exec(`create schema auth; create table auth.users (id uuid primary key);
    create role anon; create role authenticated;
    grant usage on schema public to anon, authenticated;`);
  await db.exec(await readFile(new URL("../migrations/20261001000000_initial_travel_schema.sql", import.meta.url), "utf8"));
  await db.query("insert into auth.users values ($1), ($2)", [userA, userB]);
  await db.query("insert into public.profiles(id) values ($1), ($2)", [userA, userB]);
  await db.exec("insert into public.countries values ('JP', 'Japan', 'AS'), ('IT', 'Italy', 'EU')");
  for (const [label, user] of [["a", userA], ["b", userB]]) {
    ids[`city${label}`] = await insert("insert into public.cities(user_id,country_code,name,latitude,longitude) values ($1,'JP','Kyoto',35,135)", [user]);
    ids[`trip${label}`] = await insert("insert into public.trips(user_id,title,primary_country_code,start_date,end_date) values ($1,'Japan 2025','JP','2025-04-12','2025-04-27')", [user]);
    ids[`tc${label}`] = await insert("insert into public.trip_cities(user_id,trip_id,city_id) values ($1,$2,$3)", [user, ids[`trip${label}`], ids[`city${label}`]]);
    ids[`place${label}`] = await insert("insert into public.places(user_id,trip_id,trip_city_id,name,latitude,longitude) values ($1,$2,$3,'Fushimi Inari',34.967,135.772)", [user, ids[`trip${label}`], ids[`tc${label}`]]);
    ids[`photo${label}`] = await insert("insert into public.photos(user_id,trip_id,place_id,storage_path) values ($1,$2,$3,$4)", [user, ids[`trip${label}`], ids[`place${label}`], `${user}/${ids[`trip${label}`]}/sample.jpg`]);
  }
});

after(async () => { await db.close(); });

async function isolated(action) {
  await db.exec("begin");
  try { await action(); } finally { await db.exec("rollback"); }
}

async function rejectsSql(sql, values, code) {
  await assert.rejects(db.query(sql, values), (error) => error.code === code);
}

test("invalid trip dates and blank titles are rejected", async () => {
  for (const [column, value] of [["end_date", "2024-01-01"], ["start_date", "infinity"], ["title", "   "]]) {
    await rejectsSql(`update public.trips set ${column}=$1 where id=$2`, [value, ids.tripa], "23514");
  }
});

test("coordinates reject out-of-range and NaN values", async () => {
  for (const table of ["cities", "places"]) {
    for (const [column, value] of [["latitude", 91], ["longitude", -181], ["latitude", "NaN"]]) {
      await rejectsSql(`update public.${table} set ${column}=$1`, [value], "23514");
    }
  }
});

test("repeated trips reuse the same city without duplicating visit identity", () => isolated(async () => {
  const trip = await insert("insert into public.trips(user_id,title,primary_country_code,start_date,end_date) values ($1,'Japan 2025','JP','2025-04-12','2025-04-27')", [userA]);
  await db.query("insert into public.trip_cities(user_id,trip_id,city_id) values ($1,$2,$3)", [userA, trip, ids.citya]);
  assert.equal((await db.query("select count(distinct city_id)::int as count from public.trip_cities where user_id=$1", [userA])).rows[0].count, 1);
}));

test("duplicate city names are normalized within owner, country, and region", async () => {
  await rejectsSql("insert into public.cities(user_id,country_code,name,latitude,longitude) values ($1,'JP','  KYOTO  ',35,135)", [userA], "23505");
  await rejectsSql("insert into public.trip_cities(user_id,trip_id,city_id) values ($1,$2,$3)", [userA, ids.tripa, ids.citya], "23505");
});

test("a trip can include cities from another country", () => isolated(async () => {
  const city = await insert("insert into public.cities(user_id,country_code,name,latitude,longitude) values ($1,'IT','Rome',41.9,12.5)", [userA]);
  await db.query("insert into public.trip_cities(user_id,trip_id,city_id) values ($1,$2,$3)", [userA, ids.tripa, city]);
}));

test("cross-user city and trip references are rejected", async () => {
  await rejectsSql("insert into public.trip_cities(user_id,trip_id,city_id) values ($1,$2,$3)", [userA, ids.tripa, ids.cityb], "23503");
  await rejectsSql("insert into public.trip_cities(user_id,trip_id,city_id) values ($1,$2,$3)", [userA, ids.tripb, ids.citya], "23503");
});

test("a photo cannot link to another user's place or become another trip's cover", async () => {
  await rejectsSql("update public.photos set place_id=$1 where id=$2", [ids.placeb, ids.photoa], "23503");
  await rejectsSql("update public.trips set cover_photo_id=$1 where id=$2", [ids.photob, ids.tripa], "23503");
});

test("same-owner cross-trip place and cover links are also rejected", () => isolated(async () => {
  const trip = await insert("insert into public.trips(user_id,title,primary_country_code,start_date,end_date) values ($1,'Return','JP','2026-01-01','2026-01-01')", [userA]);
  await db.exec("savepoint bad_cover");
  await rejectsSql("update public.trips set cover_photo_id=$1 where id=$2", [ids.photoa, trip], "23503");
  await db.exec("rollback to bad_cover");
  await db.exec("savepoint bad_place");
  await rejectsSql("insert into public.photos(user_id,trip_id,place_id,storage_path) values ($1,$2,$3,$4)", [userA, trip, ids.placea, `${userA}/${trip}/other.jpg`], "23503");
  await db.exec("rollback to bad_place");
}));

test("photos require unique owner/trip-scoped object paths", async () => {
  for (const path of ["https://example.com/photo.jpg", `${userB}/${ids.tripa}/photo.jpg`, `${userA}/${ids.tripa}/../photo.jpg`]) {
    await rejectsSql("update public.photos set storage_path=$1 where id=$2", [path, ids.photoa], "23514");
  }
  await rejectsSql("insert into public.photos(user_id,trip_id,storage_path) values ($1,$2,$3)", [userA, ids.tripa, `${userA}/${ids.tripa}/sample.jpg`], "23505");
});

test("deleting a place preserves its photos and clears the association", () => isolated(async () => {
  await db.query("delete from public.places where id=$1", [ids.placea]);
  const photo = (await db.query("select place_id, trip_id, user_id from public.photos where id=$1", [ids.photoa])).rows[0];
  assert.deepEqual(photo, { place_id: null, trip_id: ids.tripa, user_id: userA });
}));

test("deleting a city visit removes its places but keeps trip photos", () => isolated(async () => {
  await db.query("delete from public.trip_cities where id=$1", [ids.tca]);
  assert.equal((await db.query("select id from public.places where id=$1", [ids.placea])).rows.length, 0);
  const photo = (await db.query("select place_id,trip_id from public.photos where id=$1", [ids.photoa])).rows[0];
  assert.deepEqual(photo, { place_id: null, trip_id: ids.tripa });
}));

test("a referenced city cannot be deleted at commit", async () => {
  await db.exec("begin");
  try {
    await db.query("delete from public.cities where id=$1", [ids.citya]);
    await assert.rejects(db.exec("commit"), (error) => error.code === "23503");
  } finally {
    await db.exec("rollback");
  }
  assert.equal((await db.query("select id from public.cities where id=$1", [ids.citya])).rows.length, 1);
});

test("deleting a cover photo preserves the trip and clears only its cover", () => isolated(async () => {
  await db.query("update public.trips set cover_photo_id=$1 where id=$2", [ids.photoa, ids.tripa]);
  await db.query("delete from public.photos where id=$1", [ids.photoa]);
  const trip = (await db.query("select id,user_id,cover_photo_id from public.trips where id=$1", [ids.tripa])).rows[0];
  assert.deepEqual(trip, { id: ids.tripa, user_id: userA, cover_photo_id: null });
}));

test("deleting a trip with a cover cascades children but preserves reusable cities", () => isolated(async () => {
  await db.query("update public.trips set cover_photo_id=$1 where id=$2", [ids.photoa, ids.tripa]);
  await db.query("delete from public.trips where id=$1", [ids.tripa]);
  for (const table of ["trip_cities", "places", "photos"]) {
    assert.equal((await db.query(`select count(*)::int as count from public.${table} where trip_id=$1`, [ids.tripa])).rows[0].count, 0);
  }
  assert.equal((await db.query("select id from public.cities where id=$1", [ids.citya])).rows.length, 1);
}));

test("deleting an auth user cascades only that user's data", () => isolated(async () => {
  await db.query("delete from auth.users where id=$1", [userA]);
  for (const table of ["cities", "trips", "trip_cities", "places", "photos"]) {
    assert.equal((await db.query(`select count(*)::int as count from public.${table} where user_id=$1`, [userA])).rows[0].count, 0);
    assert.equal((await db.query(`select count(*)::int as count from public.${table} where user_id=$1`, [userB])).rows[0].count, 1);
  }
}));

test("timestamps update automatically and created_at is preserved", () => isolated(async () => {
  const original = (await db.query("select created_at from public.trips where id=$1", [ids.tripa])).rows[0].created_at;
  const result = (await db.query("update public.trips set title='Edited', created_at='2000-01-01', updated_at='2000-01-01' where id=$1 returning created_at,updated_at", [ids.tripa])).rows[0];
  assert.deepEqual(result.created_at, original);
  assert.ok(result.updated_at >= original);
}));

test("all seven tables have RLS enabled, no policies, and no app grants yet", async () => {
  const rows = (await db.query("select relname,relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r'")).rows;
  assert.equal(rows.length, 7);
  assert.ok(rows.every((r) => r.relrowsecurity));
  assert.equal((await db.query("select count(*)::int as count from pg_policies where schemaname='public'")).rows[0].count, 0);
  for (const role of ["anon", "authenticated"]) {
    for (const row of rows) {
      for (const permission of ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE"]) {
        assert.equal((await db.query("select has_table_privilege($1,$2,$3) as allowed", [role, `public.${row.relname}`, permission])).rows[0].allowed, false);
      }
    }
  }
});
