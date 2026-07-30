"use client";

import { useMemo, useState } from "react";
import { Loader2, MapPin, PackageCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";

import { createOrderAction } from "@/app/ordenes/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  IVA_PCT,
  commissionPctFor,
} from "@/lib/marketplace/money";
import { formatMXN } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CarrierOption {
  vehicleId: string;
  label: string;
  carrierName: string;
  rating: number;
  distanceKm: number | null;
  trips: number;
  fleteTotal: number;
}

export function OrderCheckoutForm({
  listing,
  qty,
  carrierOptions,
}: {
  listing: {
    id: string;
    title: string;
    price: number;
    unit: string;
    quantity: number;
    isRental: boolean;
    pickupDisponible: boolean;
    fleteDisponible: boolean;
    seller: string;
  };
  qty: number;
  carrierOptions: CarrierOption[];
}) {
  const canFlete = listing.fleteDisponible && carrierOptions.length > 0;
  const [delivery, setDelivery] = useState<"pickup" | "flete">(
    listing.pickupDisponible || !canFlete ? "pickup" : "flete"
  );
  const [vehicleId, setVehicleId] = useState<string | null>(
    carrierOptions[0]?.vehicleId ?? null
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected = carrierOptions.find((c) => c.vehicleId === vehicleId);
  const totals = useMemo(() => {
    const subtotal = listing.price * qty;
    const flete = delivery === "flete" && selected ? selected.fleteTotal : 0;
    const iva = Math.round((subtotal + flete) * IVA_PCT) / 100;
    return {
      subtotal,
      flete,
      iva,
      total: Math.round((subtotal + flete + iva) * 100) / 100,
      commissionPct: commissionPctFor(subtotal, "spei"),
    };
  }, [listing.price, qty, delivery, selected]);

  async function submit() {
    setSubmitting(true);
    const result = await createOrderAction({
      listingId: listing.id,
      qty,
      delivery,
      carrierVehicleId: delivery === "flete" ? (vehicleId ?? undefined) : undefined,
      notes,
    });
    // En éxito la acción redirige a la orden; solo manejamos error.
    if (result?.error) {
      toast.error(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[26px] tracking-tight text-ink">
          Crear orden
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          {listing.title} · {listing.seller}
        </p>
      </div>

      {/* Resumen de cantidad (se cambia desde el anuncio) */}
      <div className="flex items-center justify-between rounded-xl border border-[#ECE4DB] bg-white px-4 py-3">
        <span className="text-sm font-semibold text-ink">
          {listing.isRental ? "Días de renta" : "Cantidad"}
        </span>
        <span className="font-mono text-sm font-bold tabular-nums text-ink">
          {qty} {listing.isRental ? (qty === 1 ? "día" : "días") : listing.unit}
        </span>
      </div>

      {/* Entrega */}
      <div className="space-y-2">
        <Label>Entrega</Label>
        <div className="space-y-2">
          {listing.pickupDisponible && (
            <button
              type="button"
              onClick={() => setDelivery("pickup")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border bg-white p-4 text-left transition-colors",
                delivery === "pickup"
                  ? "border-brand bg-brand/5"
                  : "border-[#E6DED4] hover:border-brand/60"
              )}
            >
              <PackageCheck
                className={cn(
                  "h-5 w-5",
                  delivery === "pickup" ? "text-brand" : "text-texto-suave"
                )}
              />
              <span>
                <span className="block text-sm font-bold text-ink">
                  Recolección en sitio
                </span>
                <span className="block text-xs text-texto-suave">
                  Coordinas la recogida con el vendedor por el chat de la orden
                </span>
              </span>
            </button>
          )}

          {listing.fleteDisponible && (
            <div
              className={cn(
                "rounded-xl border bg-white transition-colors",
                delivery === "flete"
                  ? "border-brand"
                  : "border-[#E6DED4]"
              )}
            >
              <button
                type="button"
                disabled={!canFlete}
                onClick={() => canFlete && setDelivery("flete")}
                className="flex w-full items-center gap-3 p-4 text-left disabled:cursor-not-allowed"
              >
                <Truck
                  className={cn(
                    "h-5 w-5",
                    delivery === "flete" ? "text-brand" : "text-texto-suave"
                  )}
                />
                <span>
                  <span className="block text-sm font-bold text-ink">
                    Flete con fletero asociado
                  </span>
                  <span className="block text-xs text-texto-suave">
                    {canFlete
                      ? "Solo verás fleteros verificados compatibles con esta carga"
                      : "Aún no hay fleteros compatibles con esta carga"}
                  </span>
                </span>
              </button>

              {delivery === "flete" && canFlete && (
                <div className="space-y-1.5 border-t border-[#F2ECE4] p-3">
                  {carrierOptions.map((c) => (
                    <button
                      key={c.vehicleId}
                      type="button"
                      onClick={() => setVehicleId(c.vehicleId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        vehicleId === c.vehicleId
                          ? "border-brand bg-[#FBEADF]/60"
                          : "border-transparent hover:bg-canvas"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold text-ink">
                          {c.label}
                        </div>
                        <div className="flex items-center gap-2 text-[11.5px] text-[#8B8178]">
                          <span className="truncate">{c.carrierName}</span>
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="h-[10px] w-[10px] fill-brand text-brand" strokeWidth={0} />
                            {c.rating}
                          </span>
                          {c.distanceKm != null && (
                            <span className="inline-flex items-center gap-0.5">
                              <MapPin className="h-[10px] w-[10px]" strokeWidth={2.2} />
                              {c.distanceKm} km
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-[12.5px] font-bold tabular-nums text-ink">
                          {formatMXN(c.fleteTotal)}
                        </div>
                        <div className="text-[10.5px] font-semibold text-texto-suave">
                          {c.trips === 1 ? "1 viaje" : `${c.trips} viajes`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas para el vendedor (opcional)</Label>
        <textarea
          id="notes"
          rows={3}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Horario de entrega, referencias de la obra…"
          className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Desglose transparente (principio v2.2: todo se muestra ANTES) */}
      <div className="rounded-xl border border-[#ECE4DB] bg-white p-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-[#6B6259]">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{formatMXN(totals.subtotal)}</span>
          </div>
          {totals.flete > 0 && (
            <div className="flex justify-between text-[#6B6259]">
              <span>Flete{selected && selected.trips > 1 ? ` (${selected.trips} viajes)` : ""}</span>
              <span className="font-mono tabular-nums">{formatMXN(totals.flete)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#6B6259]">
            <span>IVA {IVA_PCT}%</span>
            <span className="font-mono tabular-nums">{formatMXN(totals.iva)}</span>
          </div>
          <div className="flex justify-between border-t border-[#F2ECE4] pt-2 text-base font-bold text-ink">
            <span>Total</span>
            <span className="font-mono tabular-nums">{formatMXN(totals.total)}</span>
          </div>
        </div>
        <p className="mt-3 border-t border-[#F2ECE4] pt-2.5 text-[11.5px] leading-relaxed text-[#A1968B]">
          La comisión Remnak ({totals.commissionPct}%) la paga el vendedor, no
          tú. Pagos en línea próximamente: por ahora el pago se acuerda
          directamente con el vendedor y tú confirmas cada paso en la orden.
        </p>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={submitting || (delivery === "flete" && !vehicleId)}
        onClick={submit}
      >
        {submitting && <Loader2 className="animate-spin" />}
        Crear orden
      </Button>
    </div>
  );
}
