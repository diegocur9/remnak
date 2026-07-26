-- ============================================================================
-- Remnak · Dimensiones unitarias de carga + cálculo de viajes (aprobado
-- 2026-07-25). Ejecutar COMPLETO en: Supabase Dashboard → SQL Editor → Run.
--
-- Motivación (decisión del usuario): los anuncios listan N unidades de un
-- producto; la carga real se calcula POR UNIDAD × cantidad. Con esto el
-- matching sabe cuántas unidades caben por viaje en cada vehículo y cuántos
-- viajes hacen falta para mover toda la mercancía (p.ej. 600 blocks en
-- redilas de 3.5 t = 2 viajes). Además, el largo unitario resuelve el gap
-- de la regla §5.1-4 (largo_rigido: la varilla de 12 m no cabe en caja de
-- 6.2 m aunque pese poco).
--
-- Semántica de columnas de carga en listings tras este cambio:
--   unit_weight_kg / unit_length_m / unit_width_m / unit_height_m → POR UNIDAD
--   weight_kg / cargo_volume_m3 → TOTALES del lote (los recalcula el server
--     como unidad × cantidad cuando hay datos unitarios; para granel se
--     capturan directos). El matching sigue leyendo los totales + unitarios.
-- ============================================================================

alter table public.listings
  add column if not exists unit_weight_kg numeric(10,2)
    check (unit_weight_kg is null or unit_weight_kg > 0),
  add column if not exists unit_length_m  numeric(6,2)
    check (unit_length_m is null or unit_length_m > 0),
  add column if not exists unit_width_m   numeric(6,2)
    check (unit_width_m  is null or unit_width_m  > 0),
  add column if not exists unit_height_m  numeric(6,2)
    check (unit_height_m is null or unit_height_m > 0);

comment on column public.listings.unit_weight_kg is
  'Peso POR UNIDAD (kg). Total = unit_weight_kg × quantity (lo calcula el server en weight_kg).';
comment on column public.listings.unit_length_m is
  'Largo POR UNIDAD (m) — dimensión crítica para largo_rigido (§5.1 regla 4).';

-- ----------------------------------------------------------------------------
-- Verificación (opcional):
-- ----------------------------------------------------------------------------
-- select column_name from information_schema.columns
--   where table_name = 'listings' and column_name like 'unit_%';
