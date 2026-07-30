import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Boxes,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";

import { ListingRowActions } from "@/components/marketplace/listing-row-actions";
import {
  LISTING_STATUS_META,
  ORDER_STATUS_META,
} from "@/lib/marketplace/dashboard";
import { fetchMyListings } from "@/lib/marketplace/queries";
import { fetchSellerOrders, orderRef } from "@/lib/marketplace/orders";
import { getSessionProfile } from "@/lib/auth/profile";
import { formatMXN } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi panel" };

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "RK";
}

export default async function PanelPage() {
  const [{ profile }, listings, orders] = await Promise.all([
    getSessionProfile(),
    fetchMyListings(),
    fetchSellerOrders(),
  ]);
  const negocio = profile?.full_name ?? "Tu negocio";
  const verificado = profile?.verification_status === "verified";
  const municipio = profile?.municipio ?? "México";

  const totalViews = listings.reduce((s, l) => s + (l.views_count ?? 0), 0);
  const totalSaves = listings.reduce((s, l) => s + (l.saves_count ?? 0), 0);
  const activos = listings.filter((l) => l.status === "active").length;

  // KPIs reales desde órdenes.
  const days30 = Date.now() - 30 * 24 * 3600 * 1000;
  const ventas30 = orders
    .filter(
      (o) =>
        o.status === "completed" &&
        o.escrow_released &&
        new Date(o.created_at ?? 0).getTime() >= days30
    )
    .reduce((s, o) => s + (o.subtotal_mxn - o.commission_mxn), 0);
  const porAtender = orders.filter((o) =>
    ["paid", "confirmed", "in_transit"].includes(o.status)
  );

  const kpis = [
    {
      label: "Ventas · 30 días",
      value: formatMXN(ventas30),
      delta:
        porAtender.length > 0
          ? `${porAtender.length} por atender`
          : "neto tras comisión",
      deltaColor: porAtender.length > 0 ? "#9A6B0E" : "#8B8178",
      icon: TrendingUp,
      iconBg: "#FBEADF",
      iconColor: "#F26B2C",
    },
    {
      label: "Anuncios activos",
      value: String(activos),
      delta: `${listings.length} en total`,
      deltaColor: "#8B8178",
      icon: ShoppingBag,
      iconBg: "#E6F0FA",
      iconColor: "#2A6FB0",
    },
    {
      label: "Vistas · guardados",
      value: `${totalViews} · ${totalSaves}`,
      delta: "todos tus anuncios",
      deltaColor: "#8B8178",
      icon: ShieldCheck,
      iconBg: "#E7F4EC",
      iconColor: "#1F8A4C",
    },
    {
      label: "Calificación",
      value:
        profile?.rating_count && profile.rating_count > 0
          ? String(Math.round((profile.rating_avg ?? 0) * 10) / 10)
          : "—",
      delta: `${profile?.rating_count ?? 0} reseñas`,
      deltaColor: "#8B8178",
      icon: Star,
      iconBg: "#FBF1DA",
      iconColor: "#F26B2C",
    },
  ];

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
              Proveedor · {municipio}
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
        {kpis.map((k) => (
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
                <k.icon
                  className="h-[17px] w-[17px]"
                  style={{ color: k.iconColor }}
                  strokeWidth={2.2}
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
        ))}
      </div>

      {/* Anuncios + lateral */}
      <div className="grid items-start gap-[22px] lg:grid-cols-[1.55fr_1fr]">
        {/* Mis anuncios (reales) */}
        <div className="overflow-hidden rounded-[18px] border border-[#ECE4DB] bg-white">
          <div className="flex items-center justify-between border-b border-[#F2ECE4] px-5 py-[18px]">
            <h2 className="font-display text-[17px] text-ink">Mis anuncios</h2>
            <span className="font-mono text-xs text-[#A1968B]">
              {listings.length}
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Boxes className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-ink">
                Aún no tienes anuncios
              </p>
              <p className="max-w-xs text-[13px] text-texto-suave">
                {verificado
                  ? "Publica tu primer material o equipo para empezar a vender."
                  : "Podrás publicar cuando tu cuenta esté verificada."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_92px_50px_84px_72px] gap-2.5 border-b border-[#F2ECE4] px-5 py-[11px] text-[11px] font-bold uppercase tracking-[.04em] text-[#A1968B]">
                <span>Anuncio</span>
                <span>Estado</span>
                <span className="text-right">Vistas</span>
                <span className="text-right">Precio</span>
                <span />
              </div>
              {listings.map((l) => {
                const m = LISTING_STATUS_META[l.status] ?? LISTING_STATUS_META.draft;
                return (
                  <div
                    key={l.id}
                    className="grid grid-cols-[1fr_92px_50px_84px_72px] items-center gap-2.5 border-b border-[#F6F1EA] px-5 py-3.5 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-[11px]">
                      <span
                        className="h-[38px] w-[38px] shrink-0 rounded-[9px] bg-cover bg-center [background-image:repeating-linear-gradient(135deg,#EFE7DD,#EFE7DD_6px,#E7DED3_6px,#E7DED3_12px)]"
                        style={
                          l.photos[0]
                            ? { backgroundImage: `url(${l.photos[0]})` }
                            : undefined
                        }
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/producto/${l.id}`}
                          className="block truncate text-[13.5px] font-bold text-ink hover:text-brand-strong"
                        >
                          {l.title}
                        </Link>
                        <div className="text-[11.5px] text-[#A1968B]">
                          {l.saves_count ?? 0} guardados
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
                      {l.views_count ?? 0}
                    </span>
                    <span className="text-right font-mono text-[13px] font-bold text-ink">
                      {formatMXN(l.price_mxn)}
                    </span>
                    <ListingRowActions id={l.id} status={l.status} />
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Columna lateral */}
        <div className="flex flex-col gap-[18px]">
          <div className="rounded-[18px] border border-[#ECE4DB] bg-white p-5">
            <h2 className="mb-3 font-display text-[17px] text-ink">
              Órdenes por atender
            </h2>
            {orders.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-texto-suave">
                Sin órdenes todavía. Cuando un comprador aparte tu material, la
                orden aparecerá aquí para prepararla y coordinarla.
              </p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {orders.slice(0, 5).map((o) => {
                  const m = ORDER_STATUS_META[o.status] ?? { label: o.status, color: "#6B6259", bg: "#F1ECE5" };
                  return (
                    <Link
                      key={o.id}
                      href={`/panel/ordenes/${o.id}`}
                      className="flex flex-col gap-1.5 border-b border-[#F6F1EA] pb-3.5 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#A1968B]">
                          {orderRef(o.id)}
                        </span>
                        <span
                          className="inline-flex rounded-[7px] px-[9px] py-[3px] text-[11px] font-bold"
                          style={{ color: m.color, background: m.bg }}
                        >
                          {m.label}
                        </span>
                      </div>
                      <div className="truncate text-[13.5px] font-bold text-ink">
                        {o.listing?.title ?? "Anuncio"}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8B8178]">
                          {o.buyer?.full_name ?? "Comprador"}
                        </span>
                        <span className="font-mono text-[13.5px] font-bold tabular-nums text-ink">
                          {formatMXN(o.total_mxn)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[18px] bg-night p-5 text-[#F3ECE3]">
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[linear-gradient(145deg,#F58440,#E0571B)]">
                <ShieldCheck className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
              </span>
              <span className="text-sm font-extrabold">Comisión Remnak</span>
            </div>
            <p className="text-[13px] leading-[1.55] text-[#A99E92]">
              Cobramos <strong className="text-white">10%</strong> con tarjeta o{" "}
              <strong className="text-white">5%</strong> con SPEI por venta
              liberada (mayoreo &gt; $10,000:{" "}
              <strong className="text-white">8% / 4%</strong>). La diferencia es
              el costo del procesador — no ganamos más por método. CFDI 4.0
              automático al liberar el escrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
