# CLAUDE.md — Remnak

## ESTADO ACTUAL — LEER PRIMERO
- Repo = scaffold (Sprint 0). Carpetas de rutas vacías. Reconstruimos el
  frontend tras pérdida del código original. Decisiones tomadas: ejecútalas,
  no las reabras.
- La DB de Supabase YA EXISTE, completa, con RLS, triggers y enums nativos.
  NO crees ni modifiques esquema sin aprobación, con UNA excepción
  pre-aprobada (ver "Migración pendiente Sprint 4").
- FUENTE DE VERDAD: types/database.ts (verificado contra la DB real).
  Antes de tocar una tabla, lee su Row ahí. No asumas columnas ni valores
  de enums.
- Stripe, Mercado Pago, Resend y Facturapi NO configurados aún. Cuando un
  sprint los necesite, primero indica al usuario qué crear en cada
  dashboard y qué llaves pegar en .env.local.
- REGLA OBLIGATORIA: al cerrar cada tarea → git add -A, commit
  convencional en inglés, git push. Sin excepciones.

## Qué es Remnak
Marketplace web de materiales de construcción (sobrantes, defectuosos,
liquidaciones, RCD), maquinaria (venta y renta por día), profesionales de
obra y logística/fletes. Campeche y Mérida, MX. Comisión ~12%, escrow,
CFDI 4.0, chat regulado anti-fuga.

## ROLES REALES (enum user_role — verificado)
cliente | proveedor | profesional | logistica | admin
- NO existe "transportista": el rol de fletes se llama `logistica`.
- MULTI-ROL: profiles.role (primario) + profiles.secondary_roles[] (array).
  Todo guard de rol debe verificar AMBOS:
  role = 'X' OR 'X' = any(secondary_roles).
- Verificación: profiles.verification_status ∈ pending|verified|rejected.
  NO existe columna is_verified.

## DECISIONES DE PRODUCTO RATIFICADAS (no reabrir)
1. CHAT SOLO DENTRO DE ÓRDENES: messages.order_id NOT NULL, no hay
   conversaciones pre-compra. Sin botón "Contactar" en producto.
2. Q&A público en listings = feature FUTURA post-piloto. No construir
   hasta orden explícita del usuario.
3. Web-first responsive. React Native después.
4. Route groups separados (cliente) y (proveedor); el (dashboard)
   genérico del scaffold se reemplaza.

## Stack (NO cambiar)
Next.js 14 App Router (NO 15) · TypeScript estricto · Tailwind 3 ·
shadcn/ui (-d) · Supabase (DB+Auth+Storage+Realtime+pg_cron) ·
TanStack Query · react-hook-form + zod · framer-motion · Sonner ·
Stripe Connect (escrow) · Mercado Pago (OXXO/SPEI) · Resend ·
Facturapi (CFDI 4.0) · Google Maps · pnpm · Vercel.
Supabase CLI instalado como devDependency: usar `pnpm supabase ...`.

## Rutas objetivo
app/(auth)/ → /login /register /verify /forgot-password /reset-password
app/(cliente)/ · app/(proveedor)/ (role-guarded, layouts propios)
app/(public)/ → /buscar /producto/[id]
app/admin/ · app/api/webhooks/{stripe,mercadopago}
Route groups NO aparecen en URL.

## ESQUEMA REAL — HECHOS VERIFICADOS (types/database.ts manda)

### Dinero
Columnas `numeric` EN PESOS MXN (price_mxn, subtotal_mxn, total_mxn,
commission_mxn, iva_mxn, flete_mxn, refund_amount). NO centavos.
Conversión a centavos SOLO en la frontera Stripe: Math.round(pesos*100).
UI: Intl.NumberFormat('es-MX', {style:'currency', currency:'MXN'}).

### Enums (valores exactos, verificados)
- user_role: cliente|proveedor|profesional|logistica|admin
- verification_status: pending|verified|rejected
- listing_category: maquinaria|materiales|herramientas|profesionales|
  logistica|liquidacion
- listing_condition: nuevo|sobrante|defectuoso
- listing_price_type: fijo|renta_diaria|subasta
- listing_status: draft|active|paused|sold|flagged
- order_status: pending|paid|confirmed|in_transit|delivered|completed|
  disputed|refunded|cancelled  ← NO existe 'in_escrow'
- payment_provider: mercadopago|stripe
- freight_status: pending|assigned|in_transit|delivered|cancelled
  ("abierto" = pending)
- dispute_status: open|under_review|resolved|escalated
- message_flag_reason: email|phone|whatsapp|external_url|address|other

### Modelo de ESCROW (distinto a docs viejos — así se implementa)
El escrow NO es un status de orden. Vive en columnas de orders:
escrow_release_due (timestamptz), escrow_released (bool),
escrow_released_at. El status avanza paid→confirmed→in_transit→
delivered→completed mientras el escrow se gestiona en paralelo:
al pagar se fija escrow_release_due = now()+7d; se libera al confirmar
recepción (delivery_confirmed) o al vencer release_due sin disputa;
una disputa pone escrow_release_due = null (congela).

### orders — campos clave ya modelados
commission_mxn + commission_pct, iva_mxn (IVA por orden), total_mxn,
payment_provider + payment_id + payment_method + payment_status,
cfdi_uuid/cfdi_url/cfdi_xml_url/cfdi_issued_at (CFDI ya tiene dónde
vivir), rental_start_date/rental_end_date/days_rented (rentas),
pickup_date/delivery_date, delivery_confirmed(+_at),
buyer_notes/seller_notes, cancellation_reason, paid_at.

### profiles — campos clave
full_name, razon_social, rfc, regimen_fiscal, uso_cfdi (datos fiscales
del comprador para CFDI), curp, phone, municipio/estado/cp/lat/lng,
KYC: ine_front_url/ine_back_url/selfie_url/domicilio_url,
verification_status + verified_at + verified_by,
rating_avg + rating_count, total_purchases/total_sales,
REFERIDOS: referral_code, referral_credit_mxn, referred_by.
⚠️ NO tiene columnas de Stripe/MP (ver migración pendiente).

### listings — campos clave
user_id (NO provider_id), category/condition/price_type/status (enums),
price_mxn, quantity+unit, photos[] NOT NULL, brand/model/serial_number/
manufacture_date, subastas: auction_end_at + auction_min_bid,
logística por listing: flete_disponible + flete_precio_mxn +
pickup_disponible, RCD: es_rcd + volumen_m3, defect_certificate_url,
vida_util_meses, tags[], municipio/estado/cp/lat/lng,
views_count/saves_count, is_featured + featured_until.

### messages
order_id NOT NULL, sender_id, content (original) + content_clean
(filtrado), flagged + blocked + flag_reason (enum) + flag_detail,
expires_at (retención LFPDPPP a nivel fila — ya resuelta).

### reviews — multidimensión
rating (1-5 general) + accuracy + delivery_time + packaging + is_public.
Una por orden (order_id).

### freight_assignments
carrier_id (rol logistica), price_mxn, sct_permit, insurance_url,
tracking_url, pickup_at/delivered_at, stripe_transfer_id.

### Triggers existentes (NO duplicar su lógica en código)
on_auth_user_created (crea profile), on_favorite_change (saves_count),
on_order_delivered, on_review_created (rating_avg/count), set_*_updated_at.

### Reglas de DB
RLS activo en las 9 tablas. Storage: listing-photos (lectura pública,
escritura por carpeta {user_id}/) y verification-docs (privado).
Toda tabla/columna nueva: RLS + policies + GRANT explícito a anon y
authenticated. Tras cambio de esquema aprobado:
pnpm supabase gen types typescript --project-id evzgfloasbpykyrbxuie
> types/database.ts

## MIGRACIÓN PENDIENTE SPRINT 4 (única pre-aprobada)
alter table profiles add column stripe_account_id text,
add column stripe_charges_enabled boolean default false,
add column mp_user_id text;
No ejecutarla antes del Sprint 4. Al hacerlo: regenerar types y commit.

## Convenciones de código
- Server Actions para mutaciones; API Routes solo webhooks (firma
  verificada + idempotencia por event.id).
- components/ui/ que envuelven inputs: React.forwardRef obligatorio.
- zod en cliente Y servidor. Fechas UTC en DB, America/Merida en UI.
- UI español MX; código en inglés. Next 14: fuentes via next/font/google.

## Design system
#F26B2C sobre ink/negro, canvas cálido. Archivo Black (display),
Hanken Grotesk (UI), JetBrains Mono (montos). DESIGN-SYSTEM.md manda
si existe.

## Compliance MX
LFPDPPP (aviso + consentimiento en registro, ARCO; messages.expires_at
ya cubre retención de chat). CFDI 4.0 vía Facturapi: usar los campos
fiscales ya existentes en profiles y orders; público general → RFC
XAXX010101000 uso S01. Producción de pagos/CFDI BLOQUEADA hasta SAS:
todo sandbox. Fletes: sct_permit e insurance_url verificados antes de
asignar.

## Anti-fraude (prioridad 1)
Proveedores con verification_status='verified' antes de publicar.
Moderación de chat SIEMPRE server-side (content → content_clean).
Rate limiting en login/register/mensajes/órdenes. Service role key
jamás en cliente.

## Flujo de trabajo
Un feature por sesión. Plan si toca >3 archivos. pnpm build limpio
antes de cerrar. Commit + push al cerrar cada tarea.
