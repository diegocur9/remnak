"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth/profile";
import {
  computeTotals,
  escrowReleaseDue,
} from "@/lib/marketplace/money";
import { getCompatibleCarriers } from "@/lib/queries/vehicles";
import { fetchListingDetail } from "@/lib/marketplace/queries";
import { orderRef } from "@/lib/marketplace/orders";
import {
  moderateMessage,
  STRIKE_LIMIT,
  STRIKE_WINDOW_HOURS,
} from "@/lib/moderation";
import type { Database } from "@/types/database";

export interface OrderActionResult {
  error?: string;
}

type OrderStatus = Database["public"]["Enums"]["order_status"];

/**
 * PAGOS PENDIENTES (decisión 2026-07-30): la SAS aún no existe, así que no
 * hay llaves de MP ni CLABE. El flujo corre completo con pago "acordado
 * offline" (payment_method='offline', payment_status='simulado'); la
 * comisión se calcula con tarifa SPEI (la ruta sin procesador) y se
 * recalculará al habilitar pagos reales en este mismo punto.
 */

async function notify(
  userId: string,
  type: string,
  title: string,
  body: string | null,
  data: Record<string, string> = {}
): Promise<void> {
  // notifications: INSERT solo vía service_role (RLS lo bloquea entre users).
  try {
    const admin = createAdminClient();
    await admin
      .from("notifications")
      .insert({ user_id: userId, type, title, body, data });
  } catch {
    // best-effort
  }
}

const createOrderSchema = z.object({
  listingId: z.string().uuid(),
  qty: z.coerce.number().int().min(1).max(999),
  delivery: z.enum(["pickup", "flete"]),
  carrierVehicleId: z.string().uuid().optional(),
  notes: z.string().max(500).transform((v) => v.trim()).optional(),
});

export async function createOrderAction(
  values: unknown
): Promise<OrderActionResult> {
  const parsed = createOrderSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos de la orden inválidos." };
  const input = parsed.data;

  const { profile } = await getSessionProfile();
  if (!profile) return { error: "Inicia sesión para continuar." };
  if (profile.verification_status !== "verified") {
    return {
      error:
        "Para comprar necesitas una cuenta verificada. Estamos revisando tus datos.",
    };
  }

  const listing = await fetchListingDetail(input.listingId);
  if (!listing) return { error: "El anuncio ya no está disponible." };
  if (listing.sellerId === profile.id) {
    return { error: "No puedes comprar tu propio anuncio." };
  }
  if (listing.priceType === "subasta") {
    return { error: "Las subastas llegan después del piloto." };
  }

  const subtotal = listing.price * input.qty;

  // Flete: valida que el vehículo elegido siga siendo COMPATIBLE (server-side,
  // nunca se confía en el cliente) y calcula flete × viajes.
  let fleteMxn = 0;
  let freight: { carrierId: string; trips: number } | null = null;
  if (input.delivery === "flete") {
    if (!listing.flete || !listing.cargoCategory || !listing.weightKg) {
      return { error: "Este anuncio no ofrece flete con datos de carga." };
    }
    if (!input.carrierVehicleId) {
      return { error: "Elige un fletero para el envío." };
    }
    // La carga a transportar es lo COMPRADO: en venta escala a las unidades
    // del pedido; en renta viaja el lote completo (qty = días).
    const isRental = listing.priceType === "renta_diaria";
    const cargoQty = isRental
      ? listing.quantity
      : Math.min(input.qty, listing.quantity);
    const scale = listing.quantity > 0 ? cargoQty / listing.quantity : 1;
    const effWeightKg = listing.unitWeightKg
      ? listing.unitWeightKg * cargoQty
      : listing.weightKg * scale;
    const effVolumeM3 =
      listing.cargoVolumeM3Total != null
        ? listing.cargoVolumeM3Total * scale
        : null;
    const matches = await getCompatibleCarriers({
      cargoCategory: listing.cargoCategory,
      weightKg: effWeightKg,
      totalVolumeM3: effVolumeM3,
      requiresEquipment: listing.requiresEquipment,
      unit:
        listing.unitWeightKg && listing.unitWeightKg > 0
          ? {
              unitWeightKg: listing.unitWeightKg,
              unitLengthM: listing.unitLengthM,
              unitWidthM: listing.unitWidthM,
              unitHeightM: listing.unitHeightM,
              quantity: cargoQty,
            }
          : null,
      lat: listing.lat,
      lng: listing.lng,
    });
    const match = matches.find((m) => m.vehicle.id === input.carrierVehicleId);
    if (!match) {
      return {
        error:
          "Ese vehículo ya no es compatible con esta carga. Elige otro fletero.",
      };
    }
    fleteMxn = listing.fletePrice * match.tripPlan.trips;
    freight = { carrierId: match.carrier.id, trips: match.tripPlan.trips };
  } else if (!listing.pickupDisponible && listing.flete) {
    return { error: "Este anuncio solo ofrece entrega por flete." };
  }

  const totals = computeTotals(subtotal, fleteMxn, "spei");

  const supabase = createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      listing_id: listing.id,
      buyer_id: profile.id,
      seller_id: listing.sellerId,
      status: "pending",
      subtotal_mxn: totals.subtotalMxn,
      flete_mxn: fleteMxn || null,
      commission_pct: totals.commissionPct,
      commission_mxn: totals.commissionMxn,
      iva_mxn: totals.ivaMxn,
      total_mxn: totals.totalMxn,
      payment_method: "offline",
      payment_status: "pendiente_habilitar_pagos",
      days_rented:
        listing.priceType === "renta_diaria" ? input.qty : null,
      buyer_notes: input.notes || null,
    })
    .select("id")
    .single();
  if (error || !order) {
    return { error: "No se pudo crear la orden. Intenta de nuevo." };
  }

  if (freight) {
    // RLS no permite al comprador insertar la asignación: va vía service_role
    // tras la validación de compatibilidad de arriba.
    const admin = createAdminClient();
    await admin.from("freight_assignments").insert({
      order_id: order.id,
      carrier_id: freight.carrierId,
      price_mxn: fleteMxn,
      status: "pending",
    });
    await notify(
      freight.carrierId,
      "flete",
      `Nuevo viaje ${orderRef(order.id)}`,
      `${listing.title} · ${freight.trips} viaje(s)`,
      { order_id: order.id }
    );
  }

  await notify(
    listing.sellerId,
    "order",
    `Nueva orden ${orderRef(order.id)}`,
    listing.title,
    { order_id: order.id }
  );

  revalidatePath("/cuenta");
  revalidatePath("/panel");
  redirect(`/cuenta/ordenes/${order.id}`);
}

/** Carga la orden validando que el usuario sea la parte indicada. */
async function requireOrderParty(
  orderId: string,
  party: "buyer" | "seller" | "any"
) {
  const { profile } = await getSessionProfile();
  if (!profile) return { error: "Inicia sesión para continuar." as const };
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "Orden no encontrada." as const };
  const isBuyer = order.buyer_id === profile.id;
  const isSeller = order.seller_id === profile.id;
  if (party === "buyer" && !isBuyer)
    return { error: "Solo el comprador puede hacer esto." as const };
  if (party === "seller" && !isSeller)
    return { error: "Solo el vendedor puede hacer esto." as const };
  if (party === "any" && !isBuyer && !isSeller)
    return { error: "No participas en esta orden." as const };
  return { order, profile, isBuyer, isSeller, supabase };
}

function revalidateOrder(orderId: string) {
  revalidatePath(`/cuenta/ordenes/${orderId}`);
  revalidatePath(`/panel/ordenes/${orderId}`);
  revalidatePath("/cuenta");
  revalidatePath("/panel");
}

/**
 * "Marcar como pagado": pago acordado fuera de la app mientras no hay
 * procesador. Arranca el escrow lógico (72h). Lo marca el COMPRADOR.
 */
export async function simulatePaymentAction(
  orderId: string
): Promise<OrderActionResult> {
  const ctx = await requireOrderParty(orderId, "buyer");
  if ("error" in ctx) return { error: ctx.error };
  if (ctx.order.status !== "pending") {
    return { error: "Esta orden ya no está pendiente de pago." };
  }
  const { error } = await ctx.supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_status: "simulado",
      escrow_release_due: escrowReleaseDue(),
    })
    .eq("id", orderId);
  if (error) return { error: "No se pudo actualizar la orden." };

  await notify(
    ctx.order.seller_id,
    "order",
    `Orden ${orderRef(orderId)} pagada (acordado offline)`,
    "Confírmala para empezar a prepararla.",
    { order_id: orderId }
  );
  revalidateOrder(orderId);
  return {};
}

const SELLER_TRANSITIONS: Record<string, OrderStatus[]> = {
  // desde → siguientes permitidos para el vendedor
  paid: ["confirmed"],
  confirmed: ["in_transit"],
  in_transit: ["delivered"],
};

export async function advanceOrderAction(
  orderId: string,
  next: "confirmed" | "in_transit" | "delivered"
): Promise<OrderActionResult> {
  const ctx = await requireOrderParty(orderId, "seller");
  if ("error" in ctx) return { error: ctx.error };
  const allowed = SELLER_TRANSITIONS[ctx.order.status] ?? [];
  if (!allowed.includes(next)) {
    return { error: "Transición no válida para el estado actual." };
  }

  const patch: Database["public"]["Tables"]["orders"]["Update"] = {
    status: next,
  };
  if (next === "delivered") patch.delivery_date = new Date().toISOString();
  const { error } = await ctx.supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId);
  if (error) return { error: "No se pudo actualizar la orden." };

  // El viaje del fletero (si existe) sigue el mismo ritmo.
  if (next === "in_transit" || next === "delivered") {
    const admin = createAdminClient();
    await admin
      .from("freight_assignments")
      .update(
        next === "in_transit"
          ? { status: "in_transit", pickup_at: new Date().toISOString() }
          : { status: "delivered", delivered_at: new Date().toISOString() }
      )
      .eq("order_id", orderId);
  }

  const LABEL: Record<string, string> = {
    confirmed: "confirmada por el vendedor",
    in_transit: "en camino",
    delivered: "entregada — confirma tu recepción",
  };
  await notify(
    ctx.order.buyer_id,
    "order",
    `Orden ${orderRef(orderId)} ${LABEL[next]}`,
    null,
    { order_id: orderId }
  );
  revalidateOrder(orderId);
  return {};
}

/** El comprador confirma recepción → libera escrow (simulado) y completa. */
export async function confirmReceiptAction(
  orderId: string
): Promise<OrderActionResult> {
  const ctx = await requireOrderParty(orderId, "buyer");
  if ("error" in ctx) return { error: ctx.error };
  if (ctx.order.status !== "delivered" && ctx.order.status !== "in_transit") {
    return { error: "Aún no hay entrega que confirmar." };
  }
  const now = new Date().toISOString();
  const { error } = await ctx.supabase
    .from("orders")
    .update({
      status: "completed",
      delivery_confirmed: true,
      delivery_confirmed_at: now,
      escrow_released: true,
      escrow_released_at: now,
    })
    .eq("id", orderId);
  if (error) return { error: "No se pudo confirmar la recepción." };

  await notify(
    ctx.order.seller_id,
    "order",
    `Orden ${orderRef(orderId)} completada`,
    "El comprador confirmó la recepción — escrow liberado.",
    { order_id: orderId }
  );
  revalidateOrder(orderId);
  return {};
}

export async function cancelOrderAction(
  orderId: string,
  reason: string
): Promise<OrderActionResult> {
  const ctx = await requireOrderParty(orderId, "any");
  if ("error" in ctx) return { error: ctx.error };
  if (ctx.order.status !== "pending") {
    return { error: "Solo se cancelan órdenes pendientes de pago." };
  }
  const { error } = await ctx.supabase
    .from("orders")
    .update({
      status: "cancelled",
      cancellation_reason: reason.slice(0, 300) || "Sin motivo",
    })
    .eq("id", orderId);
  if (error) return { error: "No se pudo cancelar la orden." };

  const admin = createAdminClient();
  await admin
    .from("freight_assignments")
    .update({ status: "cancelled" })
    .eq("order_id", orderId);

  const other = ctx.isBuyer ? ctx.order.seller_id : ctx.order.buyer_id;
  await notify(other, "order", `Orden ${orderRef(orderId)} cancelada`, null, {
    order_id: orderId,
  });
  revalidateOrder(orderId);
  return {};
}

/** Chat regulado: moderación server-side + strikes (guía §6.3). */
export async function sendMessageAction(
  orderId: string,
  content: string
): Promise<OrderActionResult> {
  const text = content.trim();
  if (!text) return { error: "Escribe un mensaje." };
  if (text.length > 1000) return { error: "Máximo 1000 caracteres." };

  const ctx = await requireOrderParty(orderId, "any");
  if ("error" in ctx) return { error: ctx.error };
  if (
    ctx.order.status === "cancelled" ||
    ctx.order.status === "refunded"
  ) {
    return { error: "El chat de esta orden está cerrado." };
  }

  // Strikes: 3 mensajes flaggeados en 24h → suspensión de envío.
  const since = new Date(
    Date.now() - STRIKE_WINDOW_HOURS * 3600 * 1000
  ).toISOString();
  const { count: strikes } = await ctx.supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", ctx.profile.id)
    .eq("flagged", true)
    .gte("created_at", since);
  if ((strikes ?? 0) >= STRIKE_LIMIT) {
    return {
      error:
        "Envío suspendido 24 h por compartir datos de contacto repetidamente.",
    };
  }

  const mod = moderateMessage(text);
  const { error } = await ctx.supabase.from("messages").insert({
    order_id: orderId,
    sender_id: ctx.profile.id,
    content: text,
    content_clean: mod.clean,
    flagged: mod.flagged,
    blocked: mod.blocked,
    flag_reason: mod.reason,
    flag_detail: mod.detail,
  });
  if (error) return { error: "No se pudo enviar el mensaje." };

  if (mod.flagged) {
    return {
      error:
        (strikes ?? 0) + 1 >= STRIKE_LIMIT
          ? "Dato de contacto bloqueado. Tu envío queda suspendido 24 h."
          : "Dato de contacto no permitido — se envió una versión filtrada.",
    };
  }
  return {};
}

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  accuracy: z.coerce.number().int().min(1).max(5),
  deliveryTime: z.coerce.number().int().min(1).max(5),
  packaging: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(600).transform((v) => v.trim()).optional(),
});

export async function submitReviewAction(
  orderId: string,
  values: unknown
): Promise<OrderActionResult> {
  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) return { error: "Califica del 1 al 5." };

  const ctx = await requireOrderParty(orderId, "buyer");
  if ("error" in ctx) return { error: ctx.error };
  if (ctx.order.status !== "completed") {
    return { error: "Podrás reseñar al completarse la orden." };
  }
  const { data: existing } = await ctx.supabase
    .from("reviews")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();
  if (existing) return { error: "Esta orden ya tiene reseña." };

  // El trigger on_review_created actualiza rating_avg/count — no duplicar.
  const { error } = await ctx.supabase.from("reviews").insert({
    order_id: orderId,
    reviewer_id: ctx.profile.id,
    reviewed_id: ctx.order.seller_id,
    rating: parsed.data.rating,
    accuracy: parsed.data.accuracy,
    delivery_time: parsed.data.deliveryTime,
    packaging: parsed.data.packaging,
    comment: parsed.data.comment || null,
    is_public: true,
  });
  if (error) return { error: "No se pudo guardar la reseña." };

  await notify(
    ctx.order.seller_id,
    "review",
    `Nueva reseña ${"★".repeat(parsed.data.rating)}`,
    parsed.data.comment || null,
    { order_id: orderId }
  );
  revalidateOrder(orderId);
  return {};
}

/** Marca todas las notificaciones propias como leídas (campanita). */
export async function markNotificationsReadAction(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("read", false);
  revalidatePath("/", "layout");
}
