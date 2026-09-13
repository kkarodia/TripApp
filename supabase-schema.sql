-- ─── Users ───────────────────────────────────────────────────────────────────
create table users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  name          text not null,
  role          text not null check (role in ('manager', 'driver')),
  password_hash text not null,
  created_at    timestamptz default now()
);

-- ─── Trips ───────────────────────────────────────────────────────────────────
create table trips (
  id                      uuid primary key default gen_random_uuid(),
  reference               text unique not null,         -- e.g. T-18
  driver_id               uuid references users(id),   -- null until the trip is crewed
  warehouse_name          text not null,
  warehouse_address       text not null,
  optimise_for            text not null check (optimise_for in ('distance', 'time', 'fuel')),
  trip_type               text not null check (trip_type in ('round-trip', 'one-way')),
  status                  text not null default 'scheduled'
                            check (status in ('scheduled', 'active', 'completed', 'archived')),
  scheduled_for           date,                         -- null for an undated backlog trip
  departed_at             timestamptz,
  completed_at            timestamptz,
  total_distance_km       numeric,
  total_estimated_minutes integer,
  fuel_index              numeric,
  dispatcher_notes        text,
  created_at              timestamptz default now()
);

-- ─── Stops ───────────────────────────────────────────────────────────────────
create table stops (
  id                  uuid primary key default gen_random_uuid(),
  trip_id             uuid references trips(id) on delete cascade,
  sequence            integer not null,
  client_name         text not null,
  address             text not null,
  latitude            numeric,
  longitude           numeric,
  geocode_failed      boolean default false,
  road_type           text default 'unknown'
                        check (road_type in ('motorway', 'national', 'urban', 'unknown')),
  distance_km         numeric,
  estimated_minutes   integer,
  status              text not null default 'pending'
                        check (status in ('pending', 'arrived', 'skipped')),
  arrived_at          timestamptz,
  orders              text,
  created_at          timestamptz default now(),
  unique (trip_id, sequence)
);

-- ─── Notifications ────────────────────────────────────────────────────────────
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  driver_id   uuid references users(id) on delete cascade,
  trip_id     uuid references trips(id) on delete set null,
  title       text not null,
  message     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ─── Row-level security ───────────────────────────────────────────────────────
-- NOTE: backend uses service key so RLS is bypassed server-side.
-- These policies protect against direct Supabase client access.
alter table trips enable row level security;
alter table stops enable row level security;
alter table notifications enable row level security;

-- Drivers see only their own trips
create policy "driver_own_trips" on trips
  for select using (driver_id = auth.uid());

-- Drivers see stops only for their own trips
create policy "driver_own_stops" on stops
  for select using (
    trip_id in (select id from trips where driver_id = auth.uid())
  );

-- Drivers see only their own notifications
create policy "driver_own_notifications" on notifications
  for select using (driver_id = auth.uid());

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime on stops so admin dashboard updates live
alter publication supabase_realtime add table stops;
alter publication supabase_realtime add table notifications;
