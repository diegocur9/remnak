/**
 * Verifica los fixes de supabase/sql/2026-07-25-service-role-grants-and-
 * profile-protection.sql contra el proyecto real:
 *   A) service_role puede SELECT/UPDATE tablas (GRANTs aplicados)
 *   B) un usuario autenticado NO puede auto-verificarse (trigger activo)
 *   C) un usuario autenticado NO puede escalar a admin
 *
 * Uso: node scripts/check-db-security.mjs
 * Usa la cuenta semilla bloquera-san-jose (pending) como conejillo.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const SEED_EMAIL = "bloquera-san-jose@seed.remnak.mx";
const SEED_PASSWORD = "SeedRemnak2026!x";

let pass = 0;
let fail = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  ok ? pass++ : fail++;
}

// A) GRANTs de service_role
{
  const { error: selErr } = await admin
    .from("profiles")
    .select("id", { head: true, count: "exact" });
  check("A1 service_role SELECT profiles", !selErr, selErr?.message);

  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const seed = users.users.find((u) => u.email === SEED_EMAIL);
  if (!seed) {
    check("A2 usuario semilla existe", false, "corre antes: node scripts/seed.mjs");
  } else {
    const { error: updErr } = await admin
      .from("profiles")
      .update({ municipio: "Campeche" })
      .eq("id", seed.id);
    check("A2 service_role UPDATE profiles", !updErr, updErr?.message);

    // B/C) vía authenticated
    await admin.auth.admin.updateUserById(seed.id, { password: SEED_PASSWORD });
    const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data: sess, error: sErr } = await anon.auth.signInWithPassword({
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
    });
    if (sErr) {
      check("B0 login cuenta semilla", false, sErr.message);
    } else {
      const authed = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${sess.session.access_token}` } },
        auth: { persistSession: false },
      });

      // B) intento de auto-verificación → debe quedar en 'pending'
      await authed
        .from("profiles")
        .update({ verification_status: "verified" })
        .eq("id", seed.id);
      const { data: after } = await authed
        .from("profiles")
        .select("verification_status")
        .eq("id", seed.id)
        .single();
      check(
        "B1 auto-verificación bloqueada",
        after?.verification_status === "pending",
        `verification_status quedó en "${after?.verification_status}"`
      );

      // C) intento de escalar a admin → debe fallar con excepción
      const { error: escErr } = await authed
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", seed.id);
      check(
        "C1 escalada a admin bloqueada",
        Boolean(escErr),
        escErr ? escErr.message : "¡el update pasó!"
      );

      // restaura estado del conejillo (admin tras el fix; authed antes de él)
      const restore = { role: "proveedor", verification_status: "pending" };
      const { error: rErr } = await admin
        .from("profiles")
        .update(restore)
        .eq("id", seed.id);
      if (rErr) {
        await authed.from("profiles").update(restore).eq("id", seed.id);
      }
    }
  }
}

console.log(`\n${pass} OK · ${fail} fallando ${fail ? "→ revisa el SQL" : "→ todo aplicado"}`);
process.exit(fail ? 1 : 0);
