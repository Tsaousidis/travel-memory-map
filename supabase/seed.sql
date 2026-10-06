-- Development fixtures only. Run in the Supabase SQL Editor after both migrations.
-- Replace the single placeholder below with an existing Authentication > Users UID.
-- One DO statement is atomic: an error rolls back every insert.
do $seed$
declare
  owner_id uuid := 'REPLACE_WITH_AUTH_USER_ID';
  dataset jsonb := $demo$
[
  {
    "key": "japan-2025",
    "title": "Japan 2025",
    "country": "JP",
    "start": "2025-04-12",
    "end": "2025-04-27",
    "description": "A fictional spring journey through bright streets, quiet gardens, and small food stalls.",
    "notes": "Demo memory: leaving room for unplanned walks became the best part of each day.",
    "cities": [
      {
        "name": "Tokyo",
        "country": "JP",
        "lat": 35.6762,
        "lon": 139.6503,
        "places": [
          {
            "key": "shibuya-sky",
            "name": "Shibuya Sky",
            "category": "landmark",
            "lat": 35.6584,
            "lon": 139.7022,
            "date": "2025-04-13",
            "notes": "Demo memory: watching the city lights appear at dusk."
          },
          {
            "key": "senso-ji",
            "name": "Senso-ji",
            "category": "landmark",
            "lat": 35.7148,
            "lon": 139.7967,
            "date": "2025-04-15",
            "notes": "Demo memory: a slow morning around the temple."
          }
        ]
      },
      {
        "name": "Kyoto",
        "country": "JP",
        "lat": 35.0116,
        "lon": 135.7681,
        "places": [
          {
            "key": "fushimi-inari",
            "name": "Fushimi Inari",
            "category": "landmark",
            "lat": 34.9671,
            "lon": 135.7727,
            "date": "2025-04-19",
            "notes": "Demo memory: an early walk beneath the red gates."
          },
          {
            "key": "arashiyama",
            "name": "Arashiyama",
            "category": "nature",
            "lat": 35.017,
            "lon": 135.671,
            "date": "2025-04-20",
            "notes": "Demo memory: listening to the bamboo move in the breeze."
          }
        ]
      },
      {
        "name": "Osaka",
        "country": "JP",
        "lat": 34.6937,
        "lon": 135.5023,
        "places": [
          {
            "key": "dotonbori",
            "name": "Dotonbori",
            "category": "neighborhood",
            "lat": 34.6687,
            "lon": 135.5013,
            "date": "2025-04-25",
            "notes": "Demo memory: bright signs reflected in the canal."
          }
        ]
      }
    ]
  },
  {
    "key": "italy-2024",
    "title": "Italy 2024",
    "country": "IT",
    "start": "2024-06-03",
    "end": "2024-06-12",
    "description": "A fictional collection of piazzas, museum mornings, and long evening walks.",
    "notes": "Demo memory: keeping a notebook of favorite street corners.",
    "cities": [
      {
        "name": "Rome",
        "country": "IT",
        "lat": 41.9028,
        "lon": 12.4964,
        "places": [
          {
            "key": "colosseum",
            "name": "Colosseum",
            "category": "landmark",
            "lat": 41.8902,
            "lon": 12.4922,
            "date": "2024-06-04",
            "notes": "Demo memory: the warm stone in the late afternoon light."
          },
          {
            "key": "trastevere",
            "name": "Trastevere",
            "category": "neighborhood",
            "lat": 41.889,
            "lon": 12.47,
            "date": "2024-06-06",
            "notes": "Demo memory: wandering narrow streets after dinner."
          }
        ]
      },
      {
        "name": "Florence",
        "country": "IT",
        "lat": 43.7696,
        "lon": 11.2558,
        "places": [
          {
            "key": "uffizi",
            "name": "Uffizi Gallery",
            "category": "museum",
            "lat": 43.7678,
            "lon": 11.2553,
            "date": "2024-06-09",
            "notes": "Demo memory: taking time with one painting instead of rushing."
          }
        ]
      }
    ]
  },
  {
    "key": "iceland-2023",
    "title": "Iceland 2023",
    "country": "IS",
    "start": "2023-09-08",
    "end": "2023-09-15",
    "description": "A fictional autumn escape with coastal walks and changing skies.",
    "notes": "Demo memory: packing an extra layer for every walk.",
    "cities": [
      {
        "name": "Reykjavik",
        "country": "IS",
        "lat": 64.1466,
        "lon": -21.9426,
        "places": [
          {
            "key": "hallgrimskirkja",
            "name": "Hallgrimskirkja",
            "category": "landmark",
            "lat": 64.1417,
            "lon": -21.9266,
            "date": "2023-09-09",
            "notes": "Demo memory: colorful rooftops beneath a gray sky."
          }
        ]
      },
      {
        "name": "Vik",
        "country": "IS",
        "lat": 63.4186,
        "lon": -19.006,
        "places": [
          {
            "key": "reynisfjara",
            "name": "Reynisfjara",
            "category": "nature",
            "lat": 63.4044,
            "lon": -19.0445,
            "date": "2023-09-12",
            "notes": "Demo memory: watching the Atlantic from a distance."
          }
        ]
      }
    ]
  },
  {
    "key": "portugal-2022",
    "title": "Portugal 2022",
    "country": "PT",
    "start": "2022-05-14",
    "end": "2022-05-21",
    "description": "A fictional week of tiled facades and riverside afternoons.",
    "notes": "Demo memory: choosing a different route back each evening.",
    "cities": [
      {
        "name": "Lisbon",
        "country": "PT",
        "lat": 38.7223,
        "lon": -9.1393,
        "places": [
          {
            "key": "alfama",
            "name": "Alfama",
            "category": "neighborhood",
            "lat": 38.711,
            "lon": -9.129,
            "date": "2022-05-15",
            "notes": "Demo memory: sunlight across the tiled walls."
          }
        ]
      },
      {
        "name": "Porto",
        "country": "PT",
        "lat": 41.1579,
        "lon": -8.6291,
        "places": [
          {
            "key": "ribeira",
            "name": "Ribeira",
            "category": "neighborhood",
            "lat": 41.1408,
            "lon": -8.6131,
            "date": "2022-05-19",
            "notes": "Demo memory: a quiet afternoon beside the river."
          }
        ]
      }
    ]
  },
  {
    "key": "japan-2026",
    "title": "Tokyo revisited 2026",
    "country": "JP",
    "start": "2026-03-05",
    "end": "2026-03-09",
    "description": "A fictional return to a familiar city, kept as a separate journey.",
    "notes": "Demo memory: revisiting a favorite view in a different season.",
    "cities": [
      {
        "name": "Tokyo",
        "country": "JP",
        "lat": 35.6762,
        "lon": 139.6503,
        "places": [
          {
            "key": "shibuya-sky-return",
            "name": "Shibuya Sky",
            "category": "landmark",
            "lat": 35.6584,
            "lon": 139.7022,
            "date": "2026-03-06",
            "notes": "Demo memory: the same skyline, a new page in the notebook."
          },
          {
            "key": "ueno-park",
            "name": "Ueno Park",
            "category": "nature",
            "lat": 35.7146,
            "lon": 139.7745,
            "date": "2026-03-08",
            "notes": "Demo memory: an unhurried walk before the journey home."
          }
        ]
      }
    ]
  }
]
$demo$::jsonb;
  journey jsonb;
  destination jsonb;
  memory jsonb;
  trip_key uuid;
  city_key uuid;
  visit_key uuid;
  city_order integer;
begin
  if not exists (select 1 from auth.users where id = owner_id) then
    raise exception 'Seed target must be an existing Auth user';
  end if;

  insert into public.countries (code, name, continent_code) values
    ('JP', 'Japan', 'AS'), ('IT', 'Italy', 'EU'),
    ('IS', 'Iceland', 'EU'), ('PT', 'Portugal', 'EU')
  on conflict (code) do nothing;

  insert into public.profiles (id) values (owner_id) on conflict (id) do nothing;

  for journey in select value from jsonb_array_elements(dataset) loop
    trip_key := md5('travel-demo-v1/' || owner_id || '/trip/' || (journey->>'key'))::uuid;
    insert into public.trips (id, user_id, title, primary_country_code, start_date, end_date, description, notes)
    values (trip_key, owner_id, journey->>'title', journey->>'country',
      (journey->>'start')::date, (journey->>'end')::date, journey->>'description', journey->>'notes')
    on conflict (id) do nothing;

    city_order := 0;
    for destination in select value from jsonb_array_elements(journey->'cities') loop
      -- Reuse a matching city even when it was created outside this seed.
      insert into public.cities (id, user_id, country_code, name, latitude, longitude)
      values (md5('travel-demo-v1/' || owner_id || '/city/' || (destination->>'country') || '/' || (destination->>'name'))::uuid,
        owner_id, destination->>'country', destination->>'name',
        (destination->>'lat')::double precision, (destination->>'lon')::double precision)
      on conflict do nothing;

      select id into strict city_key from public.cities
      where user_id = owner_id and country_code = destination->>'country'
        and lower(btrim(name)) = lower(btrim(destination->>'name')) and btrim(region) = '';

      insert into public.trip_cities (id, user_id, trip_id, city_id, sort_order)
      values (md5('travel-demo-v1/' || owner_id || '/visit/' || trip_key || '/' || city_key)::uuid,
        owner_id, trip_key, city_key, city_order)
      on conflict do nothing;
      select id into strict visit_key from public.trip_cities where trip_id = trip_key and city_id = city_key and user_id = owner_id;

      for memory in select value from jsonb_array_elements(destination->'places') loop
        insert into public.places (id, user_id, trip_id, trip_city_id, name, category, latitude, longitude, visited_on, notes)
        values (md5('travel-demo-v1/' || owner_id || '/place/' || (journey->>'key') || '/' || (memory->>'key'))::uuid,
          owner_id, trip_key, visit_key, memory->>'name', memory->>'category',
          (memory->>'lat')::double precision, (memory->>'lon')::double precision,
          (memory->>'date')::date, memory->>'notes')
        on conflict (id) do nothing;
      end loop;
      city_order := city_order + 1;
    end loop;
  end loop;
end;
$seed$;

