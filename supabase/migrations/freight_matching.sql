-- ============================================================================
-- Remnak · Matching de fleteros por capacidad de carga — FASE 1 (schema)
-- Ejecutar COMPLETO en: Supabase Dashboard → SQL Editor → Run
-- Re-ejecutable: enums en DO-blocks, IF NOT EXISTS, DROP POLICY IF EXISTS.
--
-- Después de ejecutarlo: avisar para regenerar types/database.ts (FASE 2).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.vehicle_type as enum (
    'pickup',            -- camioneta pick-up (~1 t)
    'estacas',           -- camioneta de estacas / redilas (1–3.5 t)
    'rabon',             -- camión rabón (~8 t)
    'torton',            -- camión tortón (~17 t)
    'trailer',           -- tráiler caja/plataforma (25 t+)
    'lowboy',            -- cama baja para maquinaria
    'volteo',            -- volteo: granel, agregados, RCD
    'grua_articulada'    -- con grúa articulada (HIAB)
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cargo_category as enum (
    'general',           -- herramienta, misceláneo empacado
    'palletizado',       -- sacos/block en tarima
    'granel_agregados',  -- arena, grava, sascab a granel
    'acero_largas',      -- varilla, PTR, piezas largas
    'maquinaria_pesada', -- equipo que sube en cama baja
    'rcd_escombro'       -- residuos de construcción y demolición
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.vehicle_status as enum (
    'pending',   -- alta nueva, en revisión admin
    'verified',  -- documentos validados: aparece en matching
    'rejected',  -- rechazado por admin
    'inactive'   -- pausado por el fletero (toggle desde verified)
  );
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2) Tabla carrier_vehicles
-- ----------------------------------------------------------------------------
create table if not exists public.carrier_vehicles (
  id                     uuid primary key default gen_random_uuid(),
  carrier_id             uuid not null references public.profiles(id) on delete cascade,
  vehicle_type           public.vehicle_type not null,
  brand                  text,
  model                  text,
  year                   int check (year is null or year between 1980 and 2100),
  plate                  text,

  -- capacidad y dimensiones de la plataforma/caja
  max_weight_kg          numeric not null check (max_weight_kg > 0),
  max_volume_m3          numeric check (max_volume_m3 is null or max_volume_m3 > 0),
  bed_length_m           numeric check (bed_length_m is null or bed_length_m > 0),
  bed_width_m            numeric check (bed_width_m  is null or bed_width_m  > 0),
  bed_height_m           numeric check (bed_height_m is null or bed_height_m > 0),

  -- qué puede cargar y con qué equipo especial cuenta
  cargo_categories       public.cargo_category[] not null default '{}',
  special_equipment      text[] not null default '{}',   -- p.ej. grua, rampas, lona, gps

  -- evidencia y cumplimiento (SCT/seguro se validan en revisión admin)
  photos                 text[] not null default '{}',
  sct_permit             text,
  sct_permit_url         text,
  sct_permit_expires_on  date,
  insurance_url          text,
  insurance_expires_on   date,

  -- base de operación (ranking por cercanía)
  base_municipio         text,
  base_estado            text,
  lat                    double precision,
  lng                    double precision,

  status                 public.vehicle_status not null default 'pending',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.carrier_vehicles is
  'Vehículos de fleteros (rol logistica). Solo status=verified con SCT vigente participa en matching.';

-- Índices para matching y listados
create index if not exists carrier_vehicles_carrier_idx
  on public.carrier_vehicles (carrier_id);
create index if not exists carrier_vehicles_status_idx
  on public.carrier_vehicles (status);
create index if not exists carrier_vehicles_cargo_gin
  on public.carrier_vehicles using gin (cargo_categories);
create index if not exists carrier_vehicles_equipment_gin
  on public.carrier_vehicles using gin (special_equipment);

-- updated_at automático (convención set_*_updated_at del proyecto)
create or replace function public.set_carrier_vehicles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists set_carrier_vehicles_updated_at on public.carrier_vehicles;
create trigger set_carrier_vehicles_updated_at
  before update on public.carrier_vehicles
  for each row execute function public.set_carrier_vehicles_updated_at();

-- ----------------------------------------------------------------------------
-- 3) Protección de status (mismo patrón que protect_profile_sensitive_columns)
-- El dueño solo puede alternar verified <-> inactive; pending/rejected los
-- gestiona el admin (service_role). Evita el auto-"verified".
-- ----------------------------------------------------------------------------
create or replace function public.protect_carrier_vehicle_status()
returns trigger language plpgsql as $$
begin
  if pg_trigger_depth() = 1
     and current_user in ('anon', 'authenticated')
     and new.status is distinct from old.status then
    if not (
      (old.status = 'verified' and new.status = 'inactive') or
      (old.status = 'inactive' and new.status = 'verified')
    ) then
      new.status := old.status;  -- revierte en silencio cualquier otro cambio
    end if;
  end if;
  return new;
end $$;

drop trigger if exists protect_carrier_vehicle_status on public.carrier_vehicles;
create trigger protect_carrier_vehicle_status
  before update on public.carrier_vehicles
  for each row execute function public.protect_carrier_vehicle_status();

-- ----------------------------------------------------------------------------
-- 4) RLS
-- ----------------------------------------------------------------------------
alter table public.carrier_vehicles enable row level security;

-- SELECT: público solo verificados; el dueño siempre ve los suyos
drop policy if exists carrier_vehicles_select on public.carrier_vehicles;
create policy carrier_vehicles_select
  on public.carrier_vehicles for select
  to anon, authenticated
  using (status = 'verified' or carrier_id = auth.uid());

-- INSERT: solo el propio fletero (rol logistica primario o secundario),
-- y siempre nace en 'pending' (la verificación la hace admin).
drop policy if exists carrier_vehicles_insert on public.carrier_vehicles;
create policy carrier_vehicles_insert
  on public.carrier_vehicles for insert
  to authenticated
  with check (
    carrier_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'logistica' or 'logistica' = any(coalesce(p.secondary_roles, '{}')))
    )
  );

-- UPDATE: solo el dueño (carrier_id inmutable vía WITH CHECK; el trigger
-- de arriba acota los cambios de status).
drop policy if exists carrier_vehicles_update on public.carrier_vehicles;
create policy carrier_vehicles_update
  on public.carrier_vehicles for update
  to authenticated
  using (carrier_id = auth.uid())
  with check (carrier_id = auth.uid());

-- DELETE: solo el dueño (el soft-delete con viajes se decide en la app).
drop policy if exists carrier_vehicles_delete on public.carrier_vehicles;
create policy carrier_vehicles_delete
  on public.carrier_vehicles for delete
  to authenticated
  using (carrier_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5) GRANTs (regla CLAUDE.md: GRANT explícito por tabla nueva)
-- Nota: además del SELECT pedido, authenticated necesita INSERT/UPDATE/DELETE
-- a nivel privilegio de tabla — las policies de RLS solo FILTRAN filas, no
-- otorgan el privilegio. Sin esto, el alta de vehículos fallaría con 42501.
-- ----------------------------------------------------------------------------
grant select on public.carrier_vehicles to anon;
grant select, insert, update, delete on public.carrier_vehicles to authenticated;
grant select, insert, update, delete on public.carrier_vehicles to service_role;

-- ----------------------------------------------------------------------------
-- 6) ALTER listings: datos de carga para el matching
-- Nullable: anuncios existentes y sin flete no los requieren; el form los
-- exige cuando flete_disponible = true.
-- ----------------------------------------------------------------------------
alter table public.listings
  add column if not exists cargo_category     public.cargo_category,
  add column if not exists weight_kg          numeric
    check (weight_kg is null or weight_kg > 0),
  add column if not exists cargo_volume_m3    numeric
    check (cargo_volume_m3 is null or cargo_volume_m3 > 0),
  add column if not exists requires_equipment text[] not null default '{}';

comment on column public.listings.cargo_category is
  'Tipo de carga para matching de fletes (null = sin datos de flete).';

-- ----------------------------------------------------------------------------
-- Verificación rápida (opcional):
-- ----------------------------------------------------------------------------
-- select unnest(enum_range(null::public.vehicle_type));
-- select policyname from pg_policies where tablename = 'carrier_vehicles';
-- select column_name from information_schema.columns
--   where table_name = 'listings' and column_name in
--   ('cargo_category','weight_kg','cargo_volume_m3','requires_equipment');
