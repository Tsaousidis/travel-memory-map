-- Step 6. PostgreSQL 15+. Apply once, as the database owner.
-- RLS is enabled immediately; application grants/policies arrive in Step 7.
begin;

create table public.countries (
  code text primary key check (code ~ '^[A-Z]{2}$'),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  continent_code text not null check (continent_code in ('AF', 'AN', 'AS', 'EU', 'NA', 'OC', 'SA'))
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(btrim(display_name)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cities are a user's reusable destinations, not a public list of their visits.
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  country_code text not null references public.countries(code),
  name text not null check (char_length(btrim(name)) between 1 and 150),
  region text not null default '' check (char_length(region) <= 150),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create unique index cities_identity_idx on public.cities (user_id, country_code, lower(btrim(name)), lower(btrim(region)));
create index cities_country_idx on public.cities (country_code);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 150),
  primary_country_code text not null references public.countries(code),
  start_date date not null check (isfinite(start_date)),
  end_date date not null check (isfinite(end_date)),
  description text not null default '' check (char_length(description) <= 10000),
  notes text not null default '' check (char_length(notes) <= 50000),
  cover_photo_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_date_order check (end_date >= start_date),
  unique (id, user_id)
);
create index trips_user_dates_idx on public.trips (user_id, start_date desc);
create index trips_country_idx on public.trips (primary_country_code);

create table public.trip_cities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  trip_id uuid not null,
  city_id uuid not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (trip_id, user_id) references public.trips(id, user_id) on delete cascade,
  -- Check at commit so account deletion can cascade both cities and trips.
  foreign key (city_id, user_id) references public.cities(id, user_id) deferrable initially deferred,
  unique (trip_id, city_id),
  unique (id, trip_id, user_id)
);
create index trip_cities_user_idx on public.trip_cities (user_id);
create index trip_cities_city_idx on public.trip_cities (city_id, user_id);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  trip_id uuid not null,
  trip_city_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  category text not null default 'other' check (category in ('landmark', 'nature', 'museum', 'food', 'neighborhood', 'other')),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  visited_on date check (isfinite(visited_on)),
  notes text not null default '' check (char_length(notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (trip_id, user_id) references public.trips(id, user_id) on delete cascade,
  foreign key (trip_city_id, trip_id, user_id) references public.trip_cities(id, trip_id, user_id) on delete cascade,
  unique (id, trip_id, user_id)
);
create index places_user_trip_idx on public.places (user_id, trip_id);
create index places_trip_city_idx on public.places (trip_city_id, trip_id, user_id);
create index places_trip_idx on public.places (trip_id, user_id);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  trip_id uuid not null,
  place_id uuid,
  storage_path text not null unique,
  caption text not null default '' check (char_length(caption) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (trip_id, user_id) references public.trips(id, user_id) on delete cascade,
  foreign key (place_id, trip_id, user_id) references public.places(id, trip_id, user_id) on delete set null (place_id),
  constraint photos_storage_path check (
    storage_path ~ ('^' || user_id::text || '/' || trip_id::text || '/[A-Za-z0-9][A-Za-z0-9._-]*$')
    and position('..' in storage_path) = 0
    and char_length(storage_path) <= 500
  ),
  unique (id, trip_id, user_id)
);
create index photos_user_trip_idx on public.photos (user_id, trip_id);
create index photos_trip_idx on public.photos (trip_id, user_id);
create index photos_place_idx on public.photos (place_id, trip_id, user_id);

-- A cover must be a photo belonging to this exact trip and owner.
alter table public.trips add constraint trips_cover_photo_fk
  foreign key (cover_photo_id, id, user_id) references public.photos(id, trip_id, user_id)
  on delete set null (cover_photo_id) deferrable initially immediate;
create index trips_cover_photo_idx on public.trips (cover_photo_id);

create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles', 'cities', 'trips', 'trip_cities', 'places', 'photos'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
  foreach table_name in array array['countries', 'profiles', 'cities', 'trips', 'trip_cities', 'places', 'photos'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
  end loop;
end;
$$;

comment on table public.countries is 'Canonical country reference data; populated in the demo/seed step.';
comment on column public.photos.storage_path is 'Private travel-photos bucket object path: user_id/trip_id/filename. No signed URL, EXIF or GPS metadata.';
comment on column public.trips.primary_country_code is 'Main destination. Other visited countries derive from associated cities.';

commit;
