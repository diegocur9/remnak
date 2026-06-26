import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import {
  LISTING_STATUS_META,
  ORDER_STATUS_META,
  SELLER_KPIS,
  SELLER_LISTINGS,
  SELLER_ORDERS,
} from "@/lib/marketplace/dashboard";
import { getSessionProfile } from "@/lib/auth/profile";
import { formatMXN } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi panel" };

const KPI_ICONS: Record<string, LucideIcon> = {
  TrendingUp,
  ShoppingBag,
  ShieldCheck,
  Star,
};

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "RK";
}

export default async function PanelPage() {
  const { profile } = await getSessionProfile();
  const negocio = profile?.full_name ?? "Tu negocio";
  const verificado = profile?.verification_status === "verified";
  const municipio = profile?.municipio ?? "México";

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-[50px] w-[50px] items-center justify-center rounded-[13px] bg-[linear-gradient(145deg,#37302A,#221D1A)] text-[17px] font-extrabold text-[#F4B488]">
            {initials(negocio)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl tracking-tight text-ink">
                {negocio}
              </h1>
              {verificado && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F4EC] px-[9px] py-[3px] text-[11.5px] font-bold text-[#1F8A4C]">
                  <BadgeCheck className="h-3 w-3" strokeWidth={2.4} />
                  Verificado
                </span>
              )}
            </div>
            <div className="text-[13px] text-[#8B8178]">
              Proveedor · {municipio} · desde 2024
            </div>
          </div>
        </div>
        {verificado ? (
          <Link
            href="/panel/publicar"
            className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-brand px-[22px] text-[15px] font-extrabold text-white shadow-[0_6px_16px_rgba(242,107,44,.3)] transition-colors hover:bg-[#E0571B]"
          >
            <Plus className="h-[17px] w-[17px]" strokeWidth={2.6} />
            Publicar anuncio
          </Link>
        ) : (
          <span
            title="Disponible tras verificación"
            className="inline-flex h-[46px] cursor-not-allowed items-center gap-2 rounded-xl bg-brand/50 px-[22px] text-[15px] font-extrabold text-white"
          >
            <Plus className="h-[17px] w-[17px]" strokeWidth={2.6} />
            Publicar anuncio
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SELLER_KPIS.map((k) => {
          const Icon = KPI_ICONS[k.icon] ?? TrendingUp;
          return (
            <div
              key={k.label}
              className="rounded-2xl border border-[#ECE4DB] bg-white p-[18px]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-[#8B8178]">
                  {k.label}
                </span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-[9px]"
                  style={{ background: k.iconBg }}
                >
                  <Icon
                    className="h-[17px] w-[17px]"
                    style={{ color: k.iconColor }}
                    strokeWidth={2.2}
                    {...(k.icon === "Star" ? { fill: k.iconColor } : {})}
                  />
                </span>
              </div>
              <div className="font-mono text-[23px] font-bold text-ink">
                {k.value}
              </div>
              <div
                className="mt-[3px] text-xs font-semibold"
                style={{ color: k.deltaColor }}
              >
                {k.delta}
              </div>
            </div>
          );
        })}
      </div>

      {/* Anuncios + Órdenes */}
      <div className="grid items-start gap-[22px] lg:grid-cols-[1.55fr_1fr]">
        {/* Mis anuncios */}
        <div className="overflow-hidden rounded-[18px] border border-[#ECE4DB] bg-white">
          <div className="flex items-center justify-between border-b border-[#F2ECE4] px-5 py-[18px]">
            <h2 className="font-display text-[17px] text-ink">Mis anuncios</h2>
            <span className="text-[12.5px] font-bold text-brand-strong">
              Ver todos
            </span>
          </div>
          <div className="grid grid-cols-[1fr_96px_56px_84px] gap-2.5 border-b border-[#F2ECE4] px-5 py-[11px] text-[11px] font-bold uppercase tracking-[.04em] text-[#A1968B]">
            <span>Anuncio</span>
            <span>Estado</span>
            <span className="text-right">Vistas</span>
            <span className="text-right">Precio</span>
          </div>
          {SELLER_LISTINGS.map((l) => {
            const m = LISTING_STATUS_META[l.status];
            return (
              <div
                key={l.title}
                className="grid grid-cols-[1fr_96px_56px_84px] items-center gap-2.5 border-b border-[#F6F1EA] px-5 py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-[11px]">
                  <span className="h-[38px] w-[38px] shrink-0 rounded-[9px] bg-[repeating-linear-gradient(135deg,#EFE7DD,#EFE7DD_6px,#E7DED3_6px,#E7DED3_12px)]" />
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-bold text-ink">
                      {l.title}
                    </div>
                    <div className="text-[11.5px] text-[#A1968B]">
                      {l.cat} · {l.saves} guardados
                    </div>
                  </div>
                </div>
                <span>
                  <span
                    className="inline-flex rounded-[7px] px-[9px] py-[3px] text-[11.5px] font-bold"
                    style={{ color: m?.color, background: m?.bg }}
                  >
                    {m?.label}
                  </span>
                </span>
                <span className="text-right font-mono text-[13px] text-[#6B6259]">
                  {l.views}
                </span>
                <span className="text-right font-mono text-[13px] font-bold text-ink">
                  {formatMXN(l.price)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Columna lateral */}
        <div className="flex flex-col gap-[18px]">
          <div className="rounded-[18px] border border-[#ECE4DB] bg-white p-5">
            <h2 className="mb-4 font-display text-[17px] text-ink">
              Órdenes por atender
            </h2>
            <div className="flex flex-col gap-3.5">
              {SELLER_ORDERS.map((o) => {
                const m = ORDER_STATUS_META[o.status];
                return (
                  <div
                    key={o.id}
                    className="flex flex-col gap-2 border-b border-[#F6F1EA] pb-3.5 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#A1968B]">
                        {o.id}
                      </span>
                      <span
                        className="inline-flex rounded-[7px] px-[9px] py-[3px] text-[11px] font-bold"
                        style={{ color: m?.color, background: m?.bg }}
                      >
                        {m?.label}
                      </span>
                    </div>
                    <div className="text-[13.5px] font-bold text-ink">
                      {o.item}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8B8178]">{o.buyer}</span>
                      <span className="font-mono text-[13.5px] font-bold text-ink">
                        {formatMXN(o.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[18px] bg-night p-5 text-[#F3ECE3]">
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[linear-gradient(145deg,#F58440,#E0571B)]">
                <ShieldCheck className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
              </span>
              <span className="text-sm font-extrabold">Comisión Remnak</span>
            </div>
            <p className="text-[13px] leading-[1.55] text-[#A99E92]">
              Cobramos <strong className="text-white">12%</strong> por venta
              liberada. El CFDI 4.0 se emite automáticamente a tu comprador al
              liberar el escrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
