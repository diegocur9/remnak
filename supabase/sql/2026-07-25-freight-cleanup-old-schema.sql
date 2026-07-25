-- ============================================================================
-- Remnak · LIMPIEZA del schema de fletes viejo (commit a8d998c)
--
-- Contexto: la primera versión de freight_matching.sql se ejecutó con enums
-- INFERIDOS que no coinciden con la spec oficial (Remnak_Modulo_Fleteros.docx
-- §4). Este script elimina TODO lo creado por esa versión para poder aplicar
-- la definitiva. Sin esto, los DO-blocks de la nueva migración verían los
-- enums existentes (duplicate_object) y los dejarían con valores viejos.
--
-- ORDEN DE EJECUCIÓN (SQL Editor):
--   1) Este archivo completo
--   2) supabase/migrations/freight_matching.sql (versión spec, commit 3d55953)
--
-- Seguro de ejecutar: carrier_vehicles aún no tiene UI de alta (Fase 4),
-- por lo que la tabla debe estar vacía; las columnas nuevas de listings
-- están en NULL/'{}' en todas las filas. Aun así, el DROP TABLE avisa
-- cuántas filas se perderían (ver bloque de verificación al inicio).
-- Idempotente: IF EXISTS en todo; re-ejecutable sin error.
-- ============================================================================

-- (0) Diagnóstico previo — si devuelve > 0 vehículos, DETENTE y avísame.
do $$
declare
  n bigint;
begin
  if to_regclass('public.carrier_vehicles') is not null then
    execute 'select count(*) from public.carrier_vehicles' into n;
    raise notice 'carrier_vehicles tiene % fila(s) — se eliminarán', n;
  else
    raise notice 'carrier_vehicles no existe (nada que limpiar en tabla)';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- (1) Tabla vieja (arrastra sus policies, triggers e índices)
-- ----------------------------------------------------------------------------
drop table if exists public.carrier_vehicles cascade;

-- ----------------------------------------------------------------------------
-- (2) Columnas viejas de listings
-- Se quitan LAS CUATRO: cargo_category depende del enum viejo, y
-- weight_kg / cargo_volume_m3 se recrean con la precisión exacta de la
-- spec (numeric(10,2) / numeric(8,2)) en la migración nueva.
-- ----------------------------------------------------------------------------
alter table public.listings
  drop column if exists cargo_category,
  drop column if exists weight_kg,
  drop column if exists cargo_volume_m3,
  drop column if exists requires_equipment;

-- ----------------------------------------------------------------------------
-- (3) Enums viejos (ya sin dependientes)
-- vehicle_status viejo era idéntico al nuevo, pero se recrea igual para
-- garantizar estado limpio y un solo origen (la migración de la spec).
-- ----------------------------------------------------------------------------
drop type if exists public.vehicle_type;
drop type if exists public.cargo_category;
drop type if exists public.vehicle_status;

-- ----------------------------------------------------------------------------
-- (4) Funciones de trigger viejas (los triggers murieron con la tabla;
-- la migración nueva las recrea con CREATE OR REPLACE)
-- ----------------------------------------------------------------------------
drop function if exists public.set_carrier_vehicles_updated_at();
drop function if exists public.protect_carrier_vehicle_status();

-- ----------------------------------------------------------------------------
-- Verificación (todo debe devolver 0 filas / false):
-- ----------------------------------------------------------------------------
-- select to_regclass('public.carrier_vehicles') is not null as tabla_existe;
-- select typname from pg_type
--   where typname in ('vehicle_type','cargo_category','vehicle_status');
-- select column_name from information_schema.columns
--   where table_name = 'listings' and column_name in
--   ('cargo_category','weight_kg','cargo_volume_m3','requires_equipment');
