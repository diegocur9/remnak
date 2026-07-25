-- ============================================================================
-- Remnak · Matching de fleteros por capacidad de carga — FASE 1 (schema)
-- Fuente: guidemvp/Remnak_Modulo_Fleteros.docx v1.0 (§4) — enums y columnas
-- EXACTOS de la spec. Ejecutar COMPLETO en: Supabase Dashboard → SQL Editor.
-- Re-ejecutable: enums en DO-blocks, IF NOT EXISTS, DROP POLICY IF EXISTS.
--
-- Después de ejecutarlo: avisar para regenerar types/database.ts (FASE 2).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Enums (spec §4.1)
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.vehicle_type as enum (
    'moto',        -- mensajería: hasta ~20 kg (tornillería, herramienta)
    'pickup',      -- coche/camioneta: hasta ~500 kg (lavabos, cajas, sacos)
    'redilas',     -- camión de redilas: 1–3.5 t (block, cemento, varilla)
    'volquete',    -- 3–7 t granel (grava, arena, tierra, escombro)
    'caja',        -- caja seca: 3–10 t protegido (tarimas, frágil empacado)
    'plataforma',  -- plataforma/lowboy: maquinaria pesada
    'grua',        -- grúa/remolque: autos, estructura de acero, contenedor
    'vidrio'       -- con caballete/burro: vidrio, cristal, cancelería
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cargo_category as enum (
    'granel',              -- grava, arena, tierra, escombro
    'paletizado',          -- block, cemento, tabique en tarima
    'largo_rigido',        -- varilla, tubería, perfil, PTR
    'fragil_plano',        -- vidrio, cristal templado, cancelería
    'voluminoso_pesado',   -- excavadora, retro, maquinaria
    'vehiculo_estructura', -- autos, estructura de acero
    'ligero_pequeno',      -- tornillería, herramienta, accesorios
    'sanitarios_fragil'    -- lavabo, WC, muebles de baño
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.vehicle_status as enum (
    'pending',   -- alta nueva, en revisión admin
    'verified',  -- documentos validados: participa en matching
    'rejected',  -- rechazado por admin
    'inactive'   -- pausado por el fletero (toggle desde verified)
  );
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2) Tabla carrier_vehicles (spec §4.2)
-- Nota: la cercanía del ranking §5.3 usa lat/lng del PROFILE del fletero
-- (profiles ya los tiene); el vehículo no guarda ubicación propia.
-- gen_random_uuid() en lugar de uuid_generate_v4(): nativo, sin extensión.
-- ----------------------------------------------------------------------------
create table if not exists public.carrier_vehicles (
  id                       uuid primary key default gen_random_uuid(),
  carrier_id               uuid not null references public.profiles(id) on delete cascade,
  vehicle_type             public.vehicle_type not null,
  alias                    text,            -- 'Volquete rojo', 'La camioneta'
  placas                   text not null,

  -- Capacidad (la validación real usa capacity_kg, no el tipo genérico)
  capacity_kg              numeric(10,2) not null check (capacity_kg > 0),
  cargo_length_m           numeric(6,2) check (cargo_length_m is null or cargo_length_m > 0),
  cargo_width_m            numeric(6,2) check (cargo_width_m  is null or cargo_width_m  > 0),
  cargo_height_m           numeric(6,2) check (cargo_height_m is null or cargo_height_m > 0),
  cargo_volume_m3          numeric(8,2) check (cargo_volume_m3 is null or cargo_volume_m3 > 0),

  -- Qué puede transportar
  cargo_categories         public.cargo_category[] not null default '{}',
  -- Valores conocidos: caballete_vidrio, grua_hidraulica, rampa,
  -- amarres_carga, lona_cubierta, montacargas_propio (spec §3.1)
  special_equipment        text[] not null default '{}',
  -- Redilas solo mueve granel en costales cerrados salvo este flag (§3*)
  accepts_loose_bulk       boolean not null default false,

  -- Documentación / verificación
  photos                   text[] not null default '{}',
  tarjeta_circulacion_url  text,
  poliza_seguro_url        text,
  permiso_sct              text,
  permiso_sct_vigencia     date,

  status                   public.vehicle_status not null default 'pending',
  verified_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

comment on table public.carrier_vehicles is
  'Vehículos de fleteros (rol logistica). Solo status=verified con permiso SCT vigente participa en matching (spec §5.1).';

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
-- El dueño solo alterna verified <-> inactive (toggle de FASE 3);
-- pending/rejected/verified_at los gestiona admin (service_role).
-- Evita el auto-"verified" que ya corregimos en profiles.
-- ----------------------------------------------------------------------------
create or replace function public.protect_carrier_vehicle_status()
returns trigger language plpgsql as $$
begin
  if pg_trigger_depth() = 1
     and current_user in ('anon', 'authenticated') then
    if new.status is distinct from old.status and not (
      (old.status = 'verified' and new.status = 'inactive') or
      (old.status = 'inactive' and new.status = 'verified')
    ) then
      new.status := old.status;  -- revierte en silencio
    end if;
    new.verified_at := old.verified_at;
  end if;
  return new;
end $$;

drop trigger if exists protect_carrier_vehicle_status on public.carrier_vehicles;
create trigger protect_carrier_vehicle_status
  before update on public.carrier_vehicles
  for each row execute function public.protect_carrier_vehicle_status();

-- ----------------------------------------------------------------------------
-- 4) RLS (spec Fase 1)
-- ----------------------------------------------------------------------------
alter table public.carrier_vehicles enable row level security;

-- SELECT: público solo verificados; el dueño siempre ve los suyos
drop policy if exists carrier_vehicles_select on public.carrier_vehicles;
create policy carrier_vehicles_select
  on public.carrier_vehicles for select
  to anon, authenticated
  using (status = 'verified' or carrier_id = auth.uid());

-- INSERT: solo el propio fletero (rol logistica primario o secundario,
-- regla multi-rol de CLAUDE.md) y siempre nace en 'pending'.
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

-- DELETE: solo el dueño (el soft-delete con viajes lo decide la app, FASE 3).
drop policy if exists carrier_vehicles_delete on public.carrier_vehicles;
create policy carrier_vehicles_delete
  on public.carrier_vehicles for delete
  to authenticated
  using (carrier_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5) GRANTs (regla CLAUDE.md: GRANT explícito por tabla nueva)
-- Además del SELECT pedido, authenticated necesita INSERT/UPDATE/DELETE a
-- nivel privilegio de tabla — las policies RLS solo FILTRAN filas, no
-- otorgan privilegios. Sin esto el alta fallaría con 42501.
-- ----------------------------------------------------------------------------
grant select on public.carrier_vehicles to anon;
grant select, insert, update, delete on public.carrier_vehicles to authenticated;
grant select, insert, update, delete on public.carrier_vehicles to service_role;

-- ----------------------------------------------------------------------------
-- 6) ALTER listings (spec §4.3): perfil de carga para matching
-- Nullable: no todos los listings requieren flete (p.ej. profesionales);
-- el form los exige cuando flete_disponible = true.
-- requires_equipment con NOT NULL + default: mismo contrato que photos[].
-- ----------------------------------------------------------------------------
alter table public.listings
  add column if not exists cargo_category     public.cargo_category,
  add column if not exists weight_kg          numeric(10,2)
    check (weight_kg is null or weight_kg > 0),
  add column if not exists cargo_volume_m3    numeric(8,2)
    check (cargo_volume_m3 is null or cargo_volume_m3 > 0),
  add column if not exists requires_equipment text[] not null default '{}';

comment on column public.listings.cargo_category is
  'Categoría de manejo para matching de fletes (null = sin datos de flete).';

-- ----------------------------------------------------------------------------
-- Verificación rápida (opcional):
-- ----------------------------------------------------------------------------
-- select unnest(enum_range(null::public.vehicle_type));      -- 8 tipos
-- select unnest(enum_range(null::public.cargo_category));    -- 8 categorías
-- select policyname from pg_policies where tablename = 'carrier_vehicles';
-- select column_name from information_schema.columns
--   where table_name = 'listings' and column_name in
--   ('cargo_category','weight_kg','cargo_volume_m3','requires_equipment');
