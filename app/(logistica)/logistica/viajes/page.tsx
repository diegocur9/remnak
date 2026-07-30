import type { Metadata } from "next";
import { Route } from "lucide-react";

import { FLETE_COMMISSION_PCT, fleteCommissionMxn } from "@/lib/marketplace/money";
import { fetchCarrierTrips, orderRef } from "@/lib/marketplace/orders";
import { formatMXN } from "@/lib/utils";

export const metadata: Metadata = { title: "Mis viajes" };

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Por iniciar", color: "#9A6B0E", bg: "#FBF1DA" },
  assigned: { label: "Asignado", color: "#9A6B0E", bg: "#FBF1DA" },
  in_transit: { label: "En camino", color: "#2A6FB0", bg: "#E6F0FA" },
  delivered: { label: "Entregado", color: "#1F8A4C", bg: "#E7F4EC" },
  cancelled: { label: "Cancelado", color: "#6B6259", bg: "#F1ECE5" },
};

export default async function ViajesPage() {
  const trips = await fetchCarrierTrips();

  const activos = trips.filter((t) =>
    ["pending", "assigned", "in_transit"].includes(t.status)
  );
  const completados = trips.filter((t) => t.status === "delivered");
  const netoCompletados = completados.reduce(
    (s, t) => s + (t.price_mxn - fleteCommissionMxn(t.price_mxn)),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] tracking-tight text-ink">
            Mis viajes
          </h1>
          <p className="mt-1 text-sm text-texto-suave">
            Remnak descuenta {FLETE_COMMISSION_PCT}% por viaje y liquida al
            cierre de cada uno.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-[13px] border border-[#ECE4DB] bg-white px-[18px] py-3">
            <div className="mb-0.5 text-xs text-[#8B8178]">Activos</div>
            <div className="font-mono text-[17px] font-bold text-ink">
              {activos.length}
            </div>
          </div>
          <div className="rounded-[13px] border border-[#ECE4DB] bg-white px-[18px] py-3">
            <div className="mb-0.5 text-xs text-[#8B8178]">
              Neto liquidado
            </div>
            <div className="font-mono text-[17px] font-bold text-ink">
              {formatMXN(netoCompletados)}
            </div>
          </div>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E0D6CB] bg-white py-20 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Route className="h-6 w-6" />
          </span>
          <p className="font-semibold text-ink">Aún no tienes viajes</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-texto-suave">
            Cuando un comprador elija tu vehículo para un envío, el viaje
            aparecerá aquí con su liquidación.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#ECE4DB] bg-white">
          <div className="grid grid-cols-[1fr_92px_90px_90px] gap-2.5 border-b border-[#F2ECE4] px-5 py-[11px] text-[11px] font-bold uppercase tracking-[.04em] text-[#A1968B]">
            <span>Viaje</span>
            <span>Estado</span>
            <span className="text-right">Flete</span>
            <span className="text-right">Tu neto</span>
          </div>
          {trips.map((t) => {
            const m = STATUS_META[t.status] ?? { label: t.status, color: "#6B6259", bg: "#F1ECE5" };
            const neto = t.price_mxn - fleteCommissionMxn(t.price_mxn);
            return (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_92px_90px_90px] items-center gap-2.5 border-b border-[#F6F1EA] px-5 py-3.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-bold text-ink">
                    {t.order?.listing?.title ?? "Material"}
                  </div>
                  <div className="font-mono text-[11.5px] text-[#A1968B]">
                    {t.order ? orderRef(t.order.id) : "—"}
                  </div>
                </div>
                <span>
                  <span
                    className="inline-flex rounded-[7px] px-[9px] py-[3px] text-[11px] font-bold"
                    style={{ color: m.color, background: m.bg }}
                  >
                    {m.label}
                  </span>
                </span>
                <span className="text-right font-mono text-[13px] tabular-nums text-[#6B6259]">
                  {formatMXN(t.price_mxn)}
                </span>
                <span className="text-right font-mono text-[13px] font-bold tabular-nums text-exito">
                  {formatMXN(neto)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
