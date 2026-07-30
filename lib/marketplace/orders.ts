import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type FreightRow = Database["public"]["Tables"]["freight_assignments"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

interface ListingLite {
  id: string;
  title: string;
  photos: string[];
  unit: string | null;
  price_type: Database["public"]["Enums"]["listing_price_type"];
  category: Database["public"]["Enums"]["listing_category"];
}
interface PartyLite {
  id: string;
  full_name: string | null;
  municipio: string | null;
}

export type OrderWithRefs = OrderRow & {
  listing: ListingLite | null;
  buyer: PartyLite | null;
  seller: PartyLite | null;
};

const ORDER_SELECT = `*,
  listing:listings!orders_listing_id_fkey(id, title, photos, unit, price_type, category),
  buyer:profiles!orders_buyer_id_fkey(id, full_name, municipio),
  seller:profiles!orders_seller_id_fkey(id, full_name, municipio)`;

/** Orden visible para el usuario actual (RLS: solo buyer/seller). */
export async function fetchOrder(id: string): Promise<OrderWithRefs | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as OrderWithRefs;
}

export async function fetchBuyerOrders(): Promise<OrderWithRefs[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as OrderWithRefs[];
}

export async function fetchSellerOrders(): Promise<OrderWithRefs[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as OrderWithRefs[];
}

export async function fetchOrderMessages(
  orderId: string
): Promise<MessageRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .limit(300);
  return data ?? [];
}

export async function fetchNotifications(limit = 10): Promise<{
  items: NotificationRow[];
  unread: number;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], unread: 0 };
  const [{ data: items }, { count }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false),
  ]);
  return { items: items ?? [], unread: count ?? 0 };
}

/** Flete asignado a una orden (si lo hay). */
export async function fetchOrderFreight(
  orderId: string
): Promise<FreightRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("freight_assignments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  return data ?? null;
}

/** Review existente de una orden (una por orden). */
export async function fetchOrderReview(
  orderId: string
): Promise<ReviewRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  return data ?? null;
}

export type CarrierTrip = FreightRow & {
  order:
    | (Pick<OrderRow, "id" | "status" | "created_at"> & {
        listing: Pick<ListingLite, "title"> | null;
      })
    | null;
};

/** Viajes del fletero autenticado (sección §6.4) con su orden y material. */
export async function fetchCarrierTrips(): Promise<CarrierTrip[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("freight_assignments")
    .select(
      `*, order:orders!freight_assignments_order_id_fkey(id, status, created_at, listing:listings!orders_listing_id_fkey(title))`
    )
    .eq("carrier_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as CarrierTrip[];
}

/** Paso 1..5 del timeline según status (para la barra de progreso). */
export function orderStep(status: OrderRow["status"]): number {
  switch (status) {
    case "paid":
      return 1;
    case "confirmed":
      return 2;
    case "in_transit":
      return 3;
    case "delivered":
      return 4;
    case "completed":
      return 5;
    default:
      return 0; // pending / disputed / refunded / cancelled
  }
}

/** Referencia corta legible de una orden. */
export function orderRef(id: string): string {
  return `#RMN-${id.slice(0, 4).toUpperCase()}`;
}
