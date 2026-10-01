-- Step 7. Apply after 20261001000000_initial_travel_schema.sql.
begin;

-- Authentication is required even for reference data. No anonymous grants.
grant select on public.countries to authenticated;
create policy countries_select_authenticated on public.countries
  for select to authenticated using ((select auth.uid()) is not null);

-- Each private row carries its owner. Composite FKs from Step 6 enforce that
-- referenced trips/cities/places share that owner, including on reassignment.
do $$
declare
  table_name text;
  owner_column text;
begin
  foreach table_name in array array['profiles', 'cities', 'trips', 'trip_cities', 'places', 'photos'] loop
    owner_column := case when table_name = 'profiles' then 'id' else 'user_id' end;
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = %I)', table_name || '_select_own', table_name, owner_column);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = %I)', table_name || '_insert_own', table_name, owner_column);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = %I) with check ((select auth.uid()) = %I)', table_name || '_update_own', table_name, owner_column, owner_column);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = %I)', table_name || '_delete_own', table_name, owner_column);
  end loop;
end;
$$;

commit;
