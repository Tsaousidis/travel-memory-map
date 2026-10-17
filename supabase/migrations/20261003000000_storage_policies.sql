-- Step 21. Apply after 20261002000000_travel_rls_policies.sql.
begin;

insert into storage.buckets (id, name, public)
values ('travel-photos', 'travel-photos', false)
on conflict (id) do update set public = excluded.public;

create policy travel_photos_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'travel-photos'
    and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/[A-Za-z0-9][A-Za-z0-9._-]*$'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
    and exists (
      select 1
      from public.trips
      where trips.id = ((storage.foldername(name))[2])::uuid
        and trips.user_id = (select auth.uid())
    )
  );

create policy travel_photos_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'travel-photos'
    and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/[A-Za-z0-9][A-Za-z0-9._-]*$'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
    and exists (
      select 1
      from public.trips
      where trips.id = ((storage.foldername(name))[2])::uuid
        and trips.user_id = (select auth.uid())
    )
  );

create policy travel_photos_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'travel-photos'
    and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/[A-Za-z0-9][A-Za-z0-9._-]*$'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
    and exists (
      select 1
      from public.trips
      where trips.id = ((storage.foldername(name))[2])::uuid
        and trips.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'travel-photos'
    and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/[A-Za-z0-9][A-Za-z0-9._-]*$'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
    and exists (
      select 1
      from public.trips
      where trips.id = ((storage.foldername(name))[2])::uuid
        and trips.user_id = (select auth.uid())
    )
  );

create policy travel_photos_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'travel-photos'
    and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/[A-Za-z0-9][A-Za-z0-9._-]*$'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
    and exists (
      select 1
      from public.trips
      where trips.id = ((storage.foldername(name))[2])::uuid
        and trips.user_id = (select auth.uid())
    )
  );

commit;
