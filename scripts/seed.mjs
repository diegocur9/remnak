/**
 * Seed de desarrollo: crea proveedores semilla y sus anuncios de muestra.
 * Idempotente: no duplica usuarios ni anuncios (match por título).
 *
 * Uso:
 *   node scripts/seed.mjs                       # siembra proveedores + anuncios
 *   node scripts/seed.mjs --verify=tu@mail.com  # además marca esa cuenta como verified
 *
 * SOLO desarrollo. Usa el service role (salta RLS) — nunca en cliente.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i > 0) env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !serviceKey || !anonKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ANON_KEY en .env.local");
  process.exit(1);
}
// El service role SOLO se usa para la API de auth (crear usuarios/reset pw):
// la DB aún no tiene GRANTs para service_role en las tablas (pendiente de
// correr los GRANT en el SQL editor). Los datos se escriben vía RLS
// autenticada como cada usuario semilla.
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const SEED_PASSWORD = "SeedRemnak2026!x";

async function clientAs(email) {
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({
    email,
    password: SEED_PASSWORD,
  });
  if (error) throw new Error(`signin ${email}: ${error.message}`);
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
}

/** Proveedores semilla (uno por vendedor de la muestra). */
const SELLERS = {
  "materiales-del-mayab": { name: "Materiales del Mayab", mun: "Mérida", est: "Yucatán", verified: true, rating: 4.8, ratingCount: 112 },
  "aceros-peninsular": { name: "Aceros Peninsular", mun: "Campeche", est: "Campeche", verified: true, rating: 4.9, ratingCount: 51 },
  "rentas-obra-mx": { name: "Rentas OBRA MX", mun: "Mérida", est: "Yucatán", verified: true, rating: 4.7, ratingCount: 77 },
  "bloquera-san-jose": { name: "Bloquera San José", mun: "Campeche", est: "Campeche", verified: false, rating: 4.4, ratingCount: 12 },
  "ferre-sureste": { name: "Ferre-Sureste", mun: "Mérida", est: "Yucatán", verified: true, rating: 4.7, ratingCount: 27 },
  "ecoescombros": { name: "EcoEscombros", mun: "Mérida", est: "Yucatán", verified: false, rating: 4.2, ratingCount: 8 },
};

/** Anuncios de muestra (mismos datos del design file). */
const LISTINGS = [
  { seller: "materiales-del-mayab", title: "Cemento CPC 30R — 38 sacos sobrantes", category: "materiales", condition: "sobrante", price_type: "fijo", price_mxn: 3040, quantity: 38, unit: "lote · 38 sacos", brand: "Cemex", featured: true, flete: true, flete_mxn: 480, views: 214, saves: 18, description: "Sobrante de obra terminada. Sacos íntegros, almacenados en seco. Entrega en Mérida o flete dentro de la plataforma." },
  { seller: "aceros-peninsular", title: 'Varilla 3/8" corrugada — 1.2 toneladas', category: "materiales", condition: "sobrante", price_type: "fijo", price_mxn: 18400, quantity: 1, unit: "1.2 ton", brand: "Deacero", featured: true, flete: true, flete_mxn: 900, views: 341, saves: 27, description: "Varilla corrugada 3/8 sobrante de proyecto. Sin óxido estructural, atados completos." },
  { seller: "rentas-obra-mx", title: "Minicargador Bobcat S70 — renta por día", category: "maquinaria", condition: "nuevo", price_type: "renta_diaria", price_mxn: 2850, quantity: 1, unit: "día", brand: "Bobcat", model: "S70", featured: true, flete: true, flete_mxn: 1200, views: 187, saves: 22, description: "Minicargador compacto ideal para espacios reducidos. Incluye operador opcional y entrega en obra." },
  { seller: "bloquera-san-jose", title: "Block hueco 15×20×40 — 600 pzas", category: "liquidacion", condition: "sobrante", price_type: "fijo", price_mxn: 5400, quantity: 600, unit: "600 pzas", featured: true, flete: true, flete_mxn: 650, views: 96, saves: 9, description: "Lote de liquidación por cierre de obra. Block de concreto hueco, calidad estándar." },
  { seller: "aceros-peninsular", title: "Lámina galvanizada R101 — defectuosa cal. B", category: "materiales", condition: "defectuoso", price_type: "fijo", price_mxn: 139, quantity: 120, unit: "c/u", views: 54, saves: 3, flete: false, flete_mxn: 0, description: "Lámina con detalles estéticos (rayones/golpes leves). Funcional para techumbres provisionales." },
  { seller: "rentas-obra-mx", title: "Revolvedora 1 saco 1.5 HP — renta por día", category: "maquinaria", condition: "nuevo", price_type: "renta_diaria", price_mxn: 420, quantity: 1, unit: "día", brand: "Mpro", flete: true, flete_mxn: 300, views: 143, saves: 12, description: "Revolvedora de un saco, motor 1.5 HP. Mantenimiento al día." },
  { seller: "ferre-sureste", title: "Tinaco Rotoplas 1100 L — sobrante nuevo", category: "materiales", condition: "sobrante", price_type: "fijo", price_mxn: 1750, quantity: 1, unit: "c/u", brand: "Rotoplas", flete: true, flete_mxn: 250, views: 88, saves: 7, description: "Tinaco nuevo, sobrante de pedido mayor. Con tapa y accesorios de fábrica." },
  { seller: "rentas-obra-mx", title: "Andamio tubular módulo 1.5 m — renta", category: "herramientas", condition: "sobrante", price_type: "renta_diaria", price_mxn: 95, quantity: 20, unit: "día · módulo", flete: true, flete_mxn: 200, views: 71, saves: 5, description: "Módulos de andamio tubular con crucetas y plataformas. Renta por módulo/día." },
  { seller: "ecoescombros", title: "Agregado reciclado RCD — 18 m³", category: "logistica", condition: "sobrante", price_type: "fijo", price_mxn: 7200, quantity: 18, unit: "18 m³", es_rcd: true, volumen_m3: 18, flete: true, flete_mxn: 1100, views: 39, saves: 2, description: "Agregado reciclado de demolición, cribado. Ideal para sub-base y relleno." },
];

async function findUserByEmail(email) {
  // Sin filtro server-side en listUsers: pagina y busca (dataset chico en dev).
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureSeller(slug, meta) {
  const email = `${slug}@seed.remnak.mx`;
  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: meta.name, role: "proveedor", seed: true },
    });
    if (error) throw error;
    user = data.user;
    console.log(`+ usuario ${meta.name} (${email})`);
  } else {
    // Asegura la contraseña conocida para poder iniciar sesión.
    await admin.auth.admin.updateUserById(user.id, { password: SEED_PASSWORD });
  }
  // El trigger on_auth_user_created ya creó el profile; lo completamos.
  const profilePatch = {
    full_name: meta.name,
    role: "proveedor",
    municipio: meta.mun,
    estado: meta.est,
    verification_status: meta.verified ? "verified" : "pending",
    verified_at: meta.verified ? new Date().toISOString() : null,
    rating_avg: meta.rating,
    rating_count: meta.ratingCount,
  };
  // Preferimos service_role (tras los GRANTs salta el trigger de protección
  // de columnas sensibles); si aún no hay GRANTs (42501), vía authenticated.
  const { error: adminErr } = await admin
    .from("profiles")
    .update(profilePatch)
    .eq("id", user.id);
  const authed = await clientAs(email);
  if (adminErr) {
    if (adminErr.code !== "42501") throw adminErr;
    const { error: pErr } = await authed
      .from("profiles")
      .update(profilePatch)
      .eq("id", user.id);
    if (pErr) throw pErr;
  }
  return { userId: user.id, authed };
}

async function main() {
  const verifyArg = process.argv.find((a) => a.startsWith("--verify="));

  const sellers = {};
  for (const [slug, meta] of Object.entries(SELLERS)) {
    sellers[slug] = await ensureSeller(slug, meta);
  }

  let inserted = 0;
  for (const l of LISTINGS) {
    const { userId, authed } = sellers[l.seller];
    const { data: existing } = await authed
      .from("listings")
      .select("id")
      .eq("user_id", userId)
      .eq("title", l.title)
      .maybeSingle();
    if (existing) continue;

    const seller = SELLERS[l.seller];
    const { error } = await authed.from("listings").insert({
      user_id: userId,
      title: l.title,
      description: l.description ?? null,
      category: l.category,
      condition: l.condition,
      price_type: l.price_type,
      price_mxn: l.price_mxn,
      quantity: l.quantity,
      unit: l.unit,
      brand: l.brand ?? null,
      model: l.model ?? null,
      municipio: seller.mun,
      estado: seller.est,
      photos: [],
      status: "active",
      is_featured: Boolean(l.featured),
      featured_until: l.featured
        ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
        : null,
      flete_disponible: Boolean(l.flete),
      flete_precio_mxn: l.flete ? l.flete_mxn : null,
      pickup_disponible: true,
      es_rcd: Boolean(l.es_rcd),
      volumen_m3: l.volumen_m3 ?? null,
      views_count: l.views ?? 0,
      saves_count: l.saves ?? 0,
    });
    if (error) throw error;
    inserted++;
    console.log(`+ anuncio: ${l.title}`);
  }

  if (verifyArg) {
    const email = verifyArg.split("=")[1];
    const user = await findUserByEmail(email);
    if (!user) {
      console.warn(`! no existe usuario con email ${email} (regístrate primero)`);
    } else {
      const patch = {
        verification_status: "verified",
        verified_at: new Date().toISOString(),
      };
      // Vía preferida: service_role (no toca tu contraseña).
      const { error: adminErr } = await admin
        .from("profiles")
        .update(patch)
        .eq("id", user.id);
      if (!adminErr) {
        console.log(`✓ cuenta ${email} marcada como verified`);
      } else if (adminErr.code === "42501") {
        // Sin GRANTs todavía: fallback authenticated (resetea contraseña).
        await admin.auth.admin.updateUserById(user.id, { password: SEED_PASSWORD });
        const authed = await clientAs(email);
        const { error } = await authed.from("profiles").update(patch).eq("id", user.id);
        if (error) throw error;
        console.log(`✓ cuenta ${email} marcada como verified`);
        console.warn(
          `⚠ tu contraseña se cambió temporalmente a "${SEED_PASSWORD}" — cámbiala al entrar o usa /forgot-password.`
        );
        console.warn(
          "⚠ nota: si ya corriste el SQL de protección, este fallback dejará de funcionar (correcto): usa la vía service_role corriendo antes los GRANTs."
        );
      } else {
        throw adminErr;
      }
    }
  }

  console.log(`Listo: ${inserted} anuncios nuevos (${LISTINGS.length} en muestra).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
