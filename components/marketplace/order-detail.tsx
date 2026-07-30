import Image from "next/image";
import Link from "next/link";
import { Clock, ShieldCheck, Star, Truck } from "lucide-react";

import { OrderChat } from "@/components/marketplace/order-chat";
import {
  BuyerOrderActions,
  SellerOrderActions,
} from "@/components/marketplace/order-actions";
import { OrderTimeline } from "@/components/marketplace/order-timeline";
import { ReviewForm } from "@/components/marketplace/review-form";
import { ORDER_STATUS_META } from "@/lib/marketplace/dashboard";
import {
  fetchOrderFreight,
  fetchOrderMessages,
  fetchOrderReview,
  orderRef,
  orderStep,
  type OrderWithRefs,
} from "@/lib/marketplace/orders";
import { formatMXN } from "@/lib/utils";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: "America/Merida",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Detalle completo de una orden (server). role define acciones y desglose. */
export async function OrderDetail({
  order,
  meId,
  role,
}: {
  order: OrderWithRefs;
  meId: string;
  role: "buyer" | "seller";
}) {
  const [messages, freight, review] = await Promise.all([
    fetchOrderMessages(order.id),
    fetchOrderFreight(order.id),
    fetchOrderReview(order.id),
  ]);

  const st = ORDER_STATUS_META[order.status] ?? { label: order.status, color: "#6B6259", bg: "#F1ECE5" };
  const step = orderStep(order.status);
  const closed = order.status === "cancelled" || order.status === "refunded";
  const counterpart = role === "buyer" ? order.seller : order.buyer;
  const photo = order.listing?.photos?.[0];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      {/* Columna principal */}
      <div className="space-y-5">
        <div className="rounded-[18px] border border-[#ECE4DB] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-ink">
                {orderRef(order.id)}
              </span>
              <span
                className="inline-flex rounded-full px-2.5 py-[3px] text-[11.5px] font-bold"
                style={{ color: st.color, background: st.bg }}
              >
                {st.label}
              </span>
            </div>
            <span className="text-xs text-texto-suave">
              {fmtDate(order.created_at)}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <span className="relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl bg-[repeating-linear-gradient(135deg,#EFE7DD,#EFE7DD_8px,#E7DED3_8px,#E7DED3_16px)]">
              {photo && (
                <Image
                  src={photo}
                  alt={order.listing?.title ?? "Anuncio"}
                  fill
                  sizes="62px"
                  className="object-cover"
                  unoptimized={!photo.includes(".supabase.co/storage/")}
                />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/producto/${order.listing_id}`}
                className="block truncate text-[15px] font-bold text-ink hover:text-brand-strong"
              >
                {order.listing?.title ?? "Anuncio"}
              </Link>
              <p className="text-[12.5px] text-texto-suave">
                {role === "buyer" ? "Vendedor" : "Comprador"}:{" "}
                {counterpart?.full_name ?? "—"}
                {counterpart?.municipio ? ` · ${counterpart.municipio}` : ""}
                {order.days_rented ? ` · ${order.days_rented} día(s) de renta` : ""}
              </p>
              {order.buyer_notes && (
                <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-[12.5px] text-[#6B6259]">
                  Nota del comprador: {order.buyer_notes}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <OrderTimeline step={step} />
            {closed && (
              <p className="mt-2 text-[12.5px] font-semibold text-error">
                {order.status === "cancelled"
                  ? `Cancelada${order.cancellation_reason ? ` — ${order.cancellation_reason}` : ""}`
                  : "Reembolsada"}
              </p>
            )}
          </div>

          <div className="mt-4">
            {role === "buyer" ? (
              <BuyerOrderActions orderId={order.id} status={order.status} />
            ) : (
              <SellerOrderActions orderId={order.id} status={order.status} />
            )}
          </div>
        </div>

        <OrderChat
          orderId={order.id}
          meId={meId}
          initialMessages={messages}
          closed={closed}
        />
      </div>

      {/* Columna lateral */}
      <div className="space-y-4">
        {/* Desglose */}
        <div className="rounded-[18px] border border-[#ECE4DB] bg-white p-5">
          <h2 className="mb-3 font-display text-[15px] text-ink">Desglose</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-[#6B6259]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">
                {formatMXN(order.subtotal_mxn)}
              </span>
            </div>
            {order.flete_mxn != null && order.flete_mxn > 0 && (
              <div className="flex justify-between text-[#6B6259]">
                <span>Flete</span>
                <span className="font-mono tabular-nums">
                  {formatMXN(order.flete_mxn)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#6B6259]">
              <span>IVA</span>
              <span className="font-mono tabular-nums">
                {formatMXN(order.iva_mxn)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#F2ECE4] pt-2 text-base font-bold text-ink">
              <span>Total</span>
              <span className="font-mono tabular-nums">
                {formatMXN(order.total_mxn)}
              </span>
            </div>
            {role === "seller" && (
              <>
                <div className="flex justify-between pt-1 text-[13px] text-[#6B6259]">
                  <span>Comisión Remnak ({order.commission_pct ?? 0}%)</span>
                  <span className="font-mono tabular-nums">
                    −{formatMXN(order.commission_mxn)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] font-bold text-exito">
                  <span>Recibirás</span>
                  <span className="font-mono tabular-nums">
                    {formatMXN(order.subtotal_mxn - order.commission_mxn)}
                  </span>
                </div>
              </>
            )}
          </div>
          <p className="mt-3 border-t border-[#F2ECE4] pt-2.5 text-[11px] leading-relaxed text-[#A1968B]">
            Pago acordado fuera de la app mientras habilitamos pagos en línea
            (comisión calculada con tarifa SPEI).
          </p>
        </div>

        {/* Escrow */}
        <div className="flex gap-3 rounded-[14px] border border-[#F2E6D6] bg-[#FBF6EF] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#E7F4EC]">
            <ShieldCheck className="h-5 w-5 text-[#1F8A4C]" strokeWidth={2.2} />
          </span>
          <div className="text-[12.5px] leading-[1.5] text-[#6B6259]">
            <div className="mb-0.5 flex items-center gap-1.5 text-[13px] font-bold text-ink">
              Escrow
              {order.escrow_released ? (
                <span className="text-exito">liberado</span>
              ) : order.escrow_release_due ? (
                <span className="inline-flex items-center gap-1 text-[#9A6B0E]">
                  <Clock className="h-3 w-3" />
                  vence {fmtDate(order.escrow_release_due)}
                </span>
              ) : (
                <span className="text-texto-suave">sin iniciar</span>
              )}
            </div>
            {order.escrow_released
              ? "El monto quedó liberado al vendedor."
              : "Se libera al confirmar recepción o a las 72 h sin disputa."}
          </div>
        </div>

        {/* Flete asignado */}
        {freight && (
          <div className="rounded-[14px] border border-[#ECE4DB] bg-white p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand" strokeWidth={2.2} />
              <span className="text-[13px] font-bold text-ink">
                Flete asignado
              </span>
            </div>
            <p className="text-[12.5px] text-[#6B6259]">
              {formatMXN(freight.price_mxn)} ·{" "}
              {freight.status === "cancelled"
                ? "cancelado"
                : freight.status === "delivered"
                  ? "entregado"
                  : freight.status === "in_transit"
                    ? "en camino"
                    : "por iniciar"}
            </p>
          </div>
        )}

        {/* Reseña */}
        {order.status === "completed" &&
          (review ? (
            <div className="rounded-[18px] border border-[#ECE4DB] bg-white p-5">
              <h2 className="mb-2 font-display text-[15px] text-ink">Reseña</h2>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={
                      i <= review.rating
                        ? "h-4 w-4 fill-brand text-brand"
                        : "h-4 w-4 text-[#D7CCC0]"
                    }
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              {review.comment && (
                <p className="mt-2 text-[13px] text-[#6B6259]">{review.comment}</p>
              )}
            </div>
          ) : role === "buyer" ? (
            <ReviewForm orderId={order.id} />
          ) : (
            <p className="rounded-[14px] border border-dashed border-[#E0D6CB] bg-white p-4 text-center text-[12.5px] text-texto-suave">
              El comprador aún no deja reseña.
            </p>
          ))}
      </div>
    </div>
  );
}
