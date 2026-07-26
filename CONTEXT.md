# CONTEXT.md — Remnak

Estado vivo del proyecto y specs activas. Complementa a `CLAUDE.md` (reglas
y esquema) y `DESIGN-SYSTEM.md` (diseño). Actualizar al cerrar cada sprint
o al adoptar una spec nueva.

## Estado actual (2026-07-25)

| Área | Estado |
| --- | --- |
| Design system + shell + auth completa (OTP 8 díg., multi-rol, guards) | ✅ |
| Home, catálogo /buscar (filtros+URL), ficha /producto/[id] (CTA contextual) | ✅ |
| Dashboards /panel y /cuenta · publicar con fotos · favoritos | ✅ contra Supabase real |
| Seed dev (`scripts/seed.mjs`): 6 proveedores + 9 anuncios | ✅ |
| DB asegurada: GRANTs service_role + trigger anti auto-verificación | ✅ (`scripts/check-db-security.mjs` 4/4) |
| Sprint 3 — órdenes sin pago + chat regulado + reviews | ⏸️ EN PAUSA (money.ts/orders.ts/moderation.ts en working tree, compilan) |
| **Módulo fleteros (matching por capacidad)** | ✅ Fases 1–5 completas (falta: asignación real de fletero al crear orden → depende de Sprint 3; columna de largo en listings → decisión pendiente) |
| Storage: buckets `listing-photos` + `verification-docs` + políticas | ✅ verificado 7/7 (no existían; creados 2026-07-25) |
| Pagos Stripe/MP + CFDI (Facturapi) + Resend | 🔒 Sprint 4b (sandbox; bloqueado hasta SAS) |
| Panel admin + KYC upload | Pendiente (Sprint 4a) |

Decisiones ratificadas recientes (además de las de CLAUDE.md):
- Comisión 8% / 5% mayoreo >$10,000 (configurable, A/B en piloto).
- Verificación requerida para publicar Y comprar.
- Órdenes sin pago primero; pagos reales se montan encima (Sprint 4b).

## MÓDULO DE FLETEROS — Matching por capacidad de carga (ADICIÓN REQUERIDA)

Fuente de verdad: `guidemvp/Remnak_Modulo_Fleteros.docx` v1.0 (mayo 2026).
Migración: `supabase/migrations/freight_matching.sql` (Fase 1).
Lema: *ningún material va en el vehículo equivocado* — la grava no viaja en
moto; el cristal no viaja en volquete.

### Los tres pilares
1. **Listing** declara su perfil de carga: `cargo_category`, `weight_kg`,
   `cargo_volume_m3`, `requires_equipment[]` (solo si `flete_disponible`).
2. **Vehículo** (`carrier_vehicles`) declara qué puede mover: tipo,
   `capacity_kg` (la validación real es numérica, no por tipo), dimensiones,
   `cargo_categories[]`, `special_equipment[]`, `accepts_loose_bulk`.
3. **Matching** solo ofrece fleteros compatibles — imposible elegir mal.

### Enums (valores EXACTOS de la spec §4.1)
- `vehicle_type`: moto · pickup · redilas · volquete · caja · plataforma ·
  grua · vidrio
- `cargo_category`: granel · paletizado · largo_rigido · fragil_plano ·
  voluminoso_pesado · vehiculo_estructura · ligero_pequeno · sanitarios_fragil
- `vehicle_status`: pending · verified · rejected · inactive
- Equipamiento especial (text[], catálogo §3.1): caballete_vidrio ·
  grua_hidraulica · rampa · amarres_carga · lona_cubierta · montacargas_propio

### Reglas de compatibilidad (§5.1) — TODAS deben cumplirse
1. `listing.cargo_category ∈ vehicle.cargo_categories`
2. `vehicle.capacity_kg >= listing.weight_kg`
3. `listing.requires_equipment ⊆ vehicle.special_equipment` (operador `<@`)
4. Si `largo_rigido`: `vehicle.cargo_length_m >=` largo del material ⚠ GAP:
   la spec no define columna de largo en listings — ver "Gaps" abajo
5. `vehicle.status = 'verified'` y `permiso_sct_vigencia` futura
6. Fletero con rol `logistica` (primario o secundario) y
   `profiles.verification_status = 'verified'`
- Granel suelto solo en volquete, o redilas con `accepts_loose_bulk = true`
  (en costales cerrados cualquier redilas).

### Ranking de compatibles (§5.3, en este orden)
1. `rating_avg` del fletero
2. Cercanía geográfica al punto de recolección (lat/lng del PROFILE del
   fletero — el vehículo no guarda ubicación)
3. **Ajuste de capacidad: preferir el vehículo MÁS PEQUEÑO que cumple**
   (no mandar volquete de 7 t por 100 kg de block)

### UX comprometida (§6)
- Fletero: `/logistica/vehiculos` (lista), `/nuevo` (cards visuales por tipo,
  capacidad, chips multi-select, fotos + tarjeta de circulación + póliza +
  SCT), `/[id]/editar`. Alta nace `pending` → admin verifica.
- Proveedor: al activar flete el form pide categoría/peso/equipo, sugiere
  categoría por título (p.ej. "grava" → granel) y muestra en vivo
  "Hay N fleteros que pueden transportar esto".
- Comprador: al reservar con flete ve SOLO compatibles rankeados (tipo,
  calificación, distancia, precio). Nunca ve incompatibles.
- Panel fletero: viajes (asignados/en curso/completados), comisión Remnak
  10% sobre flete, alertas de vigencia SCT/póliza (30 días, 7 días, bloqueo).

### Fases y estado
| Fase | Contenido | Estado |
| --- | --- | --- |
| 1 | Schema+RLS+GRANTs (migración + limpieza del intento previo) | ✅ aplicado en DB |
| 2 | Types regenerados + `lib/queries/vehicles.ts` (§5.1+§5.3) | ✅ validado en vivo |
| 3 | `lib/actions/vehicles.ts` + `lib/validations/vehicle.ts` + catálogos `lib/marketplace/freight.ts` | ✅ validado en vivo |
| 4 | UI fletero `/logistica/vehiculos*` (route group con guard) + buckets Storage creados + políticas SQL | ✅ (Storage 7/7) |
| 5 | Form de publicar pide carga (sugerencia por título + conteo en vivo §6.2) · ficha muestra SOLO fleteros compatibles rankeados (§6.3) | ✅ E2E: granel→volquete, paletizado→redilas, rampa→sin compatibles |

Cuentas semilla de fletes: `fletes-peninsula@seed.remnak.mx` (verificado,
volquete 7t granel-suelto + redilas 3.5t). Seed backfillea perfiles de
carga en los anuncios de muestra (revolvedora sin datos a propósito =
estado legacy).

### Gaps detectados en la spec (resolver con el usuario)
- **Largo del material** (§5.1 regla 4): listings no tiene columna de largo;
  para validar `largo_rigido` haría falta `cargo_length_m` en listings o
  capturarlo en la solicitud de flete. Propuesta: ALTER adicional en Fase 5.
- La sección de viajes del fletero (§6.4) depende de `freight_assignments`
  (ya existe en DB) y del flujo de órdenes (Sprint 3, en pausa) — se
  integra al retomar ese sprint.

### Blindajes añadidos sobre la spec (aprendizaje del fix de profiles)
- INSERT exige rol logistica y nace `pending` (WITH CHECK en RLS).
- Trigger `protect_carrier_vehicle_status`: el dueño solo alterna
  `verified ↔ inactive`; `pending→verified` y `verified_at` solo admin/
  service_role. Sin auto-verificación de vehículos.
- GRANT INSERT/UPDATE/DELETE a authenticated (las policies RLS filtran
  filas pero no otorgan privilegios; sin esto, 42501).

## Documentos fuente
- `guidemvp/Remnak_MVP_Guide_v2.docx` — guía MVP v2 (roadmap, pagos, KPIs).
  Ojo: su "estado actual" describe el código perdido; NO refleja el repo.
- `guidemvp/Remnak_Modulo_Fleteros.docx` — spec del matching de fleteros.
- `design/referencias/` — logo e ícono oficiales.
- Plan de sprints aprobado: reconciliación guía↔código (2026-07-24).
