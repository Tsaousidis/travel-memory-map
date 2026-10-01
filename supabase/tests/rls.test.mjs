import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { before, after, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const users = [randomUUID(), randomUUID()];
const tables = ["profiles", "cities", "trips", "trip_cities", "places", "photos"];
const fixtures = [{}, {}];
const fields = { profiles: "display_name", cities: "name", trips: "title", trip_cities: "sort_order", places: "name", photos: "caption" };

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
  await db.exec("insert into public.countries values ('JP','Japan','AS')");
  for (const [i, user] of users.entries()) {
    await db.query("insert into auth.users values ($1)", [user]);
    const f = fixtures[i];
    async function save(table, sql, args) {
      f[table] = (await db.query(`${sql} returning *`, args)).rows[0];
    }
    await save("profiles", "insert into public.profiles(id,display_name) values ($1,'Traveler')", [user]);
    await save("cities", "insert into public.cities(user_id,country_code,name,latitude,longitude) values ($1,'JP','Kyoto',35,135)", [user]);
    await save("trips", "insert into public.trips(user_id,title,primary_country_code,start_date,end_date) values ($1,'Japan','JP','2025-04-12','2025-04-27')", [user]);
    await save("trip_cities", "insert into public.trip_cities(user_id,trip_id,city_id) values ($1,$2,$3)", [user, f.trips.id, f.cities.id]);
    await save("places", "insert into public.places(user_id,trip_id,trip_city_id,name,latitude,longitude) values ($1,$2,$3,'Temple',35,135)", [user, f.trips.id, f.trip_cities.id]);
    await save("photos", "insert into public.photos(user_id,trip_id,place_id,storage_path) values ($1,$2,$3,$4)", [user, f.trips.id, f.places.id, `${user}/${f.trips.id}/sample.jpg`]);
  }
});
after(async () => { await db.close(); });

// Every assertion runs as the app role, never as the owner that bypasses RLS.
async function asUser(role, user, action) {
  await db.exec("begin");
  try {
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [user ?? ""]);
    await db.exec(`set local role ${role}`);
    assert.equal((await db.query("select current_user as role")).rows[0].role, role);
    await action();
    await db.exec("set constraints all immediate");
  } finally {
    await db.exec("rollback");
  }
}
const denied = (promise) => assert.rejects(promise, (e) => e.code === "42501");
const insertRow = (table, row) => db.query(`insert into public.${table} select * from json_populate_record(null::public.${table},$1::json) returning id`, [JSON.stringify(row)]);

for (const table of tables) {
  test(`${table}: each owner can select, update, delete and insert their own row`, async () => {
    for (const [i, user] of users.entries()) {
      await asUser("authenticated", user, async () => {
        const row = fixtures[i][table];
        assert.deepEqual((await db.query(`select id from public.${table}`)).rows, [{ id: row.id }]);
        const value = table === "trip_cities" ? 2 : "Edited";
        assert.equal((await db.query(`update public.${table} set ${fields[table]}=$1 where id=$2 returning id`, [value, row.id])).rows.length, 1);
        assert.equal((await db.query(`delete from public.${table} where id=$1 returning id`, [row.id])).rows.length, 1);
        assert.equal((await insertRow(table, row)).rows.length, 1);
      });
    }
  });

  test(`${table}: another owner's rows are invisible and cannot be changed or deleted`, async () => {
    await asUser("authenticated", users[0], async () => {
      const id = fixtures[1][table].id;
      assert.equal((await db.query(`select * from public.${table} where id=$1`, [id])).rows.length, 0);
      assert.equal((await db.query(`update public.${table} set ${fields[table]}=${fields[table]} where id=$1 returning id`, [id])).rows.length, 0);
      assert.equal((await db.query(`delete from public.${table} where id=$1 returning id`, [id])).rows.length, 0);
    });
  });

  test(`${table}: cannot insert a row owned by another user`, async () => {
    const row = { ...fixtures[1][table], id: table === "profiles" ? users[1] : randomUUID() };
    await assert.rejects(asUser("authenticated", users[0], () => insertRow(table, row)), (e) => e.code === "42501");
  });

  test(`${table}: cannot transfer ownership`, async () => {
    const owner = table === "profiles" ? "id" : "user_id";
    await assert.rejects(asUser("authenticated", users[0], () => db.query(`update public.${table} set ${owner}=$1 where id=$2`, [users[1], fixtures[0][table].id])), (e) => e.code === "42501");
  });

  test(`${table}: anonymous access is denied for all CRUD operations`, async () => {
    for (const sql of [`select * from public.${table}`, `insert into public.${table} default values`, `update public.${table} set ${fields[table]}=${fields[table]}`, `delete from public.${table}`]) {
      await denied(asUser("anon", null, () => db.query(sql)));
    }
  });

  test(`${table}: authenticated role with no user claim cannot access data`, async () => {
    await asUser("authenticated", null, async () => {
      assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
      assert.equal((await db.query(`delete from public.${table} returning id`)).rows.length, 0);
    });
    await denied(asUser("authenticated", null, () => insertRow(table, fixtures[0][table])));
  });
}

test("countries are read-only for signed-in users and inaccessible anonymously", async () => {
  await asUser("authenticated", users[0], async () => {
    assert.equal((await db.query("select code from public.countries")).rows[0].code, "JP");
  });
  for (const sql of ["insert into public.countries values ('IT','Italy','EU')", "update public.countries set name='Changed'", "delete from public.countries", "truncate public.countries cascade"]) {
    await denied(asUser("authenticated", users[0], () => db.query(sql)));
  }
  await denied(asUser("anon", null, () => db.query("select * from public.countries")));
  await asUser("authenticated", null, async () => {
    assert.equal((await db.query("select * from public.countries")).rows.length, 0);
  });
});

test("private tables cannot be truncated by an authenticated user", async () => {
  for (const table of tables) await denied(asUser("authenticated", users[0], () => db.exec(`truncate public.${table} cascade`)));
});

test("owner-scoped rows still cannot point to another user's parents", async () => {
  for (const [table, column, value] of [
    ["trip_cities", "city_id", fixtures[1].cities.id],
    ["places", "trip_city_id", fixtures[1].trip_cities.id],
    ["photos", "place_id", fixtures[1].places.id],
    ["trips", "cover_photo_id", fixtures[1].photos.id],
  ]) {
    await assert.rejects(asUser("authenticated", users[0], () => db.query(`update public.${table} set ${column}=$1 where id=$2`, [value, fixtures[0][table].id])), (e) => e.code === "23503");
  }
});

test("deleting own trip preserves the other user's complete trip", async () => {
  await asUser("authenticated", users[0], async () => {
    await db.query("delete from public.trips where id=$1", [fixtures[0].trips.id]);
    for (const table of ["trips", "trip_cities", "places", "photos"]) {
      assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
    }
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [users[1]]);
    for (const table of tables) assert.equal((await db.query(`select * from public.${table}`)).rows.length, 1);
  });
});
