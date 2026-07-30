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
- Comisión POR MÉTODO (guía v2.2, 2026-07-29): 10% tarjeta / 5% SPEI;
  mayoreo >$10,000: 8% / 4%. Sustituye al 8%/5% plano anterior.
- Escrow 72h sin disputa (2026-07-29); disputa congela hasta resolverse.
- Verificación requerida para publicar Y comprar.
- Órdenes sin pago real primero; en S4-core: tarjeta = MP Checkout SANDBOX
  y SPEI manual con comprobante (ver flujo abajo).

## GUÍA v2.2 — MODELO DE NEGOCIO VIGENTE (2026-07-29)

Fuente: `guidemvp/Remnak_MVP_Guide_v2.2.docx`. Sustituye a la v2 en
comisiones, métodos de pago y roadmap. Misión: transparencia, comisiones
bajas por diseño, "ganamos todos".

### Comisiones (Fase 1 · Piloto) — regla: tarjeta = SPEI + 5 pts
| Concepto | Tarjeta | SPEI |
| --- | --- | --- |
| Estándar | 10% | 5% |
| Mayoreo > $10,000 | 8% | 4% |
| Flete (al fletero) | 10% | 10% |
| Instalación (S6) | 12% | 12% |
- OXXO ELIMINADO. Métodos: tarjeta (redirect a Mercado Pago Checkout) y
  SPEI directo a CLABE de la SAS.
- Fase 3 sube a 12/7 con aviso de 90 días, grandfathering 12 meses a
  fundadores, T&C versionados. Membresía PRO (créditos de destacados, NO
  descuento de comisión) se lanza antes del incremento (Fase 2).
- A/B del piloto: pares 8/4 · 10/5 (base) · 12/6; decidir a 60 días o 100
  transacciones. KPI de salud: margen neto por método; alerta si take rate
  < 3% neto sostenido.
- Fuente en código: `lib/marketplace/money.ts` (COMMISSION_PCT,
  FLETE_COMMISSION_PCT, INSTALACION_COMMISSION_PCT, ESCROW_HOURS=72).

### Flujo SPEI (piloto — validación manual)
1. Checkout SPEI → orden `pending` mostrando CLABE de la SAS (mandato de
   cobranza en T&C: Remnak cobra "por cuenta y orden del vendedor").
2. Cliente transfiere el TOTAL y sube comprobante o clave de rastreo
   (verificable en CEP Banxico — preferirla).
3. `payment_status = 'en_validacion'` (columna text — NO tocar el enum
   order_status); el proveedor ve la orden pero aún no confirma.
4. Admin valida → `paid` → escrow normal. Dispersión al liberar:
   total − comisión − retenciones. El monto del vendedor es PASIVO
   (recurso de terceros), solo la comisión es ingreso de Remnak.
5. Fase 2: automatizar con STP/CLABE virtual por orden + webhook (SPEI de
   MP cuesta como tarjeta y mataría la ventaja del 5%).
⚠ Validar la redacción del mandato mercantil con abogado ANTES del primer
SPEI real; capturas de pantalla son falsificables (aceptable solo en piloto).

### Retenciones SAT — régimen de plataformas (programar en S6 con CFDI)
| Vendedor | ISR | IVA |
| --- | --- | --- |
| P. física CON RFC | 1% | 8% |
| P. física SIN RFC | 20% | 16% |
| P. moral CON RFC (2026) | 2.5% | 8% |
| Cuenta extranjera (2026) | según caso | 16% |
- RFC OBLIGATORIO en onboarding de proveedores (sin RFC pierde ~36%).
- CSF validada y coincidente con actividad = requisito de verificación KYC.
- UX: desglose "De $1,000 recibirás ~$X" ANTES de publicar.
- Umbral $300k/año: retención como pago definitivo (simplificación).
- Remnak: retener, enterar mensual, constancias (Facturapi), reportar SAT.
⚠ Validar con contador antes de S6.

### Nuevos requisitos v2.2
- Fotos de listing: mín 3 / máx 8 (aplicado en código).
- Detector de imágenes IA para fotos de PRODUCTOS (Sightengine/Hive,
  EXIF → detector → cola manual; nunca rechazo automático) — S6. Incode ya
  cubre anti-spoofing de documentos.
- Sin logos/marcas de agua en fotos (excepción: operadores de maquinaria
  con sello de identidad validada).
- Moderación de IMÁGENES en chat con OCR (teléfonos/direcciones embebidos)
  con la misma escalación 1/2/3 — S5.
- ARCO completo (no solo queja): formulario único `/legal/arco` (A/R/C/O),
  respuesta ≤20 días hábiles, cancelación = soft delete + anonimización
  30 días, oposición = `marketing_opt_out` (requiere migración aprobada),
  modal de aviso pre-registro + links en footer.
- Relevancia (S5): rating/reseñas verificadas/cumplimiento (alto), boost
  publicidad y KYC (medio), frescura/cercanía (bajo). Regla de oro: el
  dinero impulsa, la calidad decide (rating bajo = techo).
- Módulo Instalación (contratistas) — cotización mínima viable, S6, 12%.

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

## ROADMAP (ajustado a guía v2.2, desde el estado real)

- **S4-repair (2026-07-29, esta pasada)**: comisiones v2.2 en código+copy+
  docs · escrow 72h · fotos 3–8 · cableado de viajes (unidad × cantidad).
- **S4-core (siguiente)**: retomar Sprint 3 evolucionado — órdenes
  (crear→confirmar→entregar→recibir) con tarjeta = **MP Checkout SANDBOX**
  (redirect + webhook firma/idempotencia) y **SPEI manual** (flujo arriba);
  verificar/crear cron pg_cron de escrow 72h; chat regulado texto
  (lib/moderation.ts WIP); reviews; notificaciones in-app; **Resend**
  transaccional (dominio verificado; falta RESEND_API_KEY en .env.local);
  asignación de fletero a la orden + sección de viajes con liquidación
  (flete − 10%). En paralelo (usuario): SAS en tuempresa.gob.mx.
- **S5**: panel admin (validación SPEI, verificación manual, moderación,
  disputas), OCR imágenes chat, relevancia v1, mobile bottom nav, legal
  (/terminos, /legal/arco, modal pre-registro, migración marketing_opt_out).
- **S6 (requiere SAS)**: KYC Incode + CSF + detector IA, CFDI Facturapi +
  retenciones + constancias, MP producción, Stripe Connect split,
  Vitest/Playwright + CI, módulo Instalación (cotización, 12%), destacados
  $250 + PRO (Fase 2).
- **Confirmado 2026-07-30**: migración `freight_unit_dimensions.sql`
  aplicada (viajes E2E: block 6,000 kg → redilas "2 viajes ≈ $1,300";
  RCD 18 m³ → volquete "3 viajes" por volumen; varilla 6 m → 1 viaje) ·
  RESEND_API_KEY en .env.local (key restringida a solo-envío, válida) ·
  **cron pg_cron VERIFICADO en DB**: `release-escrow` y
  `delete-expired-messages` existen (la guía decía verdad) — revisar su
  SQL interno en S4-core para confirmar que respeta el congelamiento por
  disputa antes de confiarle liberaciones reales.
- **Pendientes del usuario**: SAS en tuempresa.gob.mx · contador
  (retenciones §3 antes de S6).

## Documentos fuente
- `guidemvp/Remnak_MVP_Guide_v2.2.docx` — **VIGENTE** (comisiones por
  método, SPEI, retenciones, requisitos v2.1/2.2). Ojo: su tabla de estado
  llegó desactualizada en dos puntos — buckets de Storage (ya creados y
  verificados) y módulo de fleteros (F1–F5 ya completo).
- `guidemvp/Remnak_MVP_Guide_v2.docx` — superada por v2.2 en comisiones.
  Su "estado actual" describe el código perdido; NO refleja el repo.
- `guidemvp/Remnak_Modulo_Fleteros.docx` — spec del matching de fleteros.
- `design/referencias/` — logo e ícono oficiales.
- Plan de sprints aprobado: reconciliación guía↔código (2026-07-24).
