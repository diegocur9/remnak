import type { Metadata } from "next";
import { BadgeCheck, Clock, Star, XCircle } from "lucide-react";

import { ProfileForm } from "@/components/perfil/profile-form";
import { createClient } from "@/lib/supabase/server";
import { ROLE_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = { title: "Mi perfil" };

const ROLE_LABEL: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label])
);
ROLE_LABEL.admin = "Admin";

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // el layout redirige

  const { data: p } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone, municipio, avatar_url, razon_social, rfc, regimen_fiscal, uso_cfdi, cp, role, secondary_roles, verification_status, rating_avg, rating_count, created_at"
    )
    .eq("id", user.id)
    .single();
  if (!p) return null;

  const roles = [p.role, ...(p.secondary_roles ?? [])]
    .filter((r, i, a) => a.indexOf(r) === i)
    .map((r) => ROLE_LABEL[r] ?? r);

  const memberSince = p.created_at
    ? new Date(p.created_at).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[26px] tracking-tight text-ink">
          Mi perfil
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-texto-suave">
          <span>{user.email}</span>
          <span aria-hidden>·</span>
          <span>{roles.join(" + ")}</span>
          {p.verification_status === "verified" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F4EC] px-[9px] py-[3px] text-[11.5px] font-bold text-[#1F8A4C]">
              <BadgeCheck className="h-3 w-3" strokeWidth={2.4} />
              Verificado
            </span>
          ) : p.verification_status === "rejected" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FBEBE9] px-[9px] py-[3px] text-[11.5px] font-bold text-[#C0392B]">
              <XCircle className="h-3 w-3" strokeWidth={2.4} />
              Rechazado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF1DA] px-[9px] py-[3px] text-[11.5px] font-bold text-[#9A6B0E]">
              <Clock className="h-3 w-3" strokeWidth={2.4} />
              Verificación pendiente
            </span>
          )}
          {(p.rating_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink">
              <Star className="h-3.5 w-3.5 fill-brand text-brand" strokeWidth={0} />
              {Math.round((p.rating_avg ?? 0) * 10) / 10} ({p.rating_count})
            </span>
          )}
          {memberSince && (
            <>
              <span aria-hidden>·</span>
              <span>desde {memberSince}</span>
            </>
          )}
        </div>
      </div>

      <ProfileForm
        userId={p.id}
        defaults={{
          fullName: p.full_name ?? "",
          phone: p.phone ?? "",
          municipio: (p.municipio ?? undefined) as never,
          avatarUrl: p.avatar_url ?? "",
          razonSocial: p.razon_social ?? "",
          rfc: p.rfc ?? "",
          regimenFiscal: p.regimen_fiscal ?? "",
          usoCfdi: p.uso_cfdi ?? "",
          cp: p.cp ?? "",
        }}
        isProvider={p.role !== "cliente"}
      />
    </div>
  );
}
