import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { ListingCard } from "@/components/marketplace/listing-card";
import { OrderTimeline } from "@/components/marketplace/order-timeline";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_META } from "@/lib/marketplace/dashboard";
import {
  fetchBuyerOrders,
  orderRef,
  orderStep,
} from "@/lib/marketplace/orders";
import { toCardView } from "@/lib/marketplace/catalog";
import { fetchSavedListings } from "@/lib/marketplace/queries";
import { getSessionProfile } from "@/lib/auth/profile";
import { formatMXN } from "@/lib/utils";

export const metadata: Metadata = { title: "Mis compras" };

export default async function CuentaPage() {
  const { profile } = await getSessionProfile();
  const nombre = profile?.full_name ?? "Tu cuenta";
  const municipio = profile?.municipio ?? "México";

  const [orders, saved] = await Promise.all([
    fetchBuyerOrders(),
    fetchSavedListings(),
  ]);

  const active = orders.filter(
    (o) => !["completed", "cancelled", "refunded"].includes(o.status)
  );
  const enEscrow = orders
    .filter((o) => o.paid_at && !o.escrow_released && o.status !== "cancelled")
    .reduce((s, o) => s + o.total_mxn, 0);

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 font-display text-[26px] tracking-tight text-ink">
            Mis compras
          </h1>
          <p className="text-sm text-[#8B8178]">
            {nombre} · Comprador · {municipio}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-[13px] border border-[#ECE4DB] bg-white px-[18px] py-3">
            <div className="mb-0.5 text-xs text-[#8B8178]">En escrow</div>
            <div className="font-mono text-[17px] font-bold text-ink">
              {formatMXN(enEscrow)}
            </div>
          </div>
          <div className="rounded-[13px] border border-[#ECE4DB] bg-white px-[18px] py-3">
            <div className="mb-0.5 text-xs text-[#8B8178]">Órdenes activas</div>
            <div className="font-mono text-[17px] font-bold text-ink">
              {active.length}
            </div>
          </div>
        </div>
      </div>

      {/* Órdenes reales */}
      {orders.length === 0 ? (
        <div className="mb-9 rounded-2xl border border-dashed border-[#E0D6CB] bg-white py-14 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <PackageSearch className="h-6 w-6" />
          </span>
          <p className="font-semibold text-ink">Aún no tienes órdenes</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-texto-suave">
            Explora materiales, maquinaria y fletes cerca de tu obra.
          </p>
          <Button asChild className="mt-4">
            <Link href="/buscar">Explorar el marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="mb-9 flex flex-col gap-4">
          {orders.map((o) => {
            const st = ORDER_STATUS_META[o.status] ?? { label: o.status, color: "#6B6259", bg: "#F1ECE5" };
            return (
              <Link
                key={o.id}
                href={`/cuenta/ordenes/${o.id}`}
                className="block rounded-[18px] border border-[#ECE4DB] bg-white p-5 transition hover:border-[#E0D6CB] hover:shadow-[0_10px_24px_rgba(41,35,31,.07)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#A1968B]">
                      {orderRef(o.id)}
                    </span>
                    <span
                      className="inline-flex rounded-full px-2 py-[2px] text-[10.5px] font-bold"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.label}
                    </span>
                  </div>
                  <span className="font-mono text-[15px] font-bold tabular-nums text-ink">
                    {formatMXN(o.total_mxn)}
                  </span>
                </div>
                <div className="mb-1 text-[15px] font-bold text-ink">
                  {o.listing?.title ?? "Anuncio"}
                </div>
                <div className="mb-3.5 text-[12.5px] text-[#8B8178]">
                  {o.seller?.full_name ?? "Vendedor"}
                </div>
                <OrderTimeline step={orderStep(o.status)} />
              </Link>
            );
          })}
        </div>
      )}

      <h2 className="mb-[18px] font-display text-[20px] text-ink">Guardados</h2>
      {saved.length > 0 ? (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((it) => (
            <ListingCard key={it.id} it={toCardView(it)} />
          ))}
        </div>
      ) : (
        <p className="text-texto-suave">Aún no has guardado anuncios.</p>
      )}
    </div>
  );
}
