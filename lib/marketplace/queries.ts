import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogItem } from "@/lib/marketplace/catalog";
import type { Database } from "@/types/database";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

/** Subconjunto del profile del vendedor que necesita el catálogo. */
interface SellerLite {
  full_name: string | null;
  verification_status: Database["public"]["Enums"]["verification_status"];
  rating_avg: number | null;
  rating_count: number | null;
}

type JoinedListing = ListingRow & { seller: SellerLite | null };

const LISTING_SELECT =
  "*, seller:profiles!listings_user_id_fkey(full_name, verification_status, rating_avg, rating_count)";

const ESTADO_ABBR: Record<string, string> = {
  Yucatán: "Yuc.",
  Campeche: "Camp.",
};

function photoLabelFrom(row: ListingRow): string {
  const first = row.photos[0];
  if (first) {
    const file = first.split("/").pop() ?? "";
    return decodeURIComponent(file).slice(0, 32) || "foto_1.jpg";
  }
  return "sin_fotos.jpg";
}

/** Mapea una fila real de listings (+seller) al view-model del catálogo. */
export function rowToItem(row: JoinedListing): CatalogItem {
  const seller = row.seller;
  return {
    id: row.id,
    title: row.title,
    cat: row.category,
    cond: row.condition,
    priceType: row.price_type,
    price: row.price_mxn,
    unit: row.unit ?? `${row.quantity} pza(s)`,
    mun: row.municipio ?? "Península",
    est: ESTADO_ABBR[row.estado ?? ""] ?? (row.estado ?? "MX"),
    seller: seller?.full_name ?? "Proveedor Remnak",
    verified: seller?.verification_status === "verified",
    rating: Math.round((seller?.rating_avg ?? 0) * 10) / 10,
    ratingCount: seller?.rating_count ?? 0,
    photoLabel: photoLabelFrom(row),
    photoUrl: row.photos[0],
    description: row.description ?? undefined,
    brand: row.brand ?? undefined,
    featured: row.is_featured ?? false,
    flete: row.flete_disponible ?? false,
    fletePrice: row.flete_precio_mxn ?? 0,
  };
}

/** Catálogo activo. `q` filtra server-side por título/descripción. */
export async function fetchCatalog(q?: string): Promise<CatalogItem[]> {
  const supabase = createClient();
  let query = supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(120);

  const term = q?.trim();
  if (term) {
    const like = `%${term.replaceAll("%", "").replaceAll(",", " ")}%`;
    query = query.or(`title.ilike.${like},description.ilike.${like}`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as JoinedListing[]).map(rowToItem);
}

/** Destacados del Home (is_featured, activos). */
export async function fetchFeatured(limit = 4): Promise<CatalogItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as unknown as JoinedListing[]).map(rowToItem);
}

export interface ListingDetail extends CatalogItem {
  photos: string[];
  model?: string;
  quantity: number;
  esRcd: boolean;
  volumenM3?: number;
  vidaUtilMeses?: number;
  sellerId: string;
  /** Perfil de carga (matching de fleteros); null = sin datos de flete. */
  cargoCategory: Database["public"]["Enums"]["cargo_category"] | null;
  weightKg: number | null;
  requiresEquipment: string[];
  lat: number | null;
  lng: number | null;
  pickupDisponible: boolean;
}

/** Ficha completa (listing activo + vendedor). */
export async function fetchListingDetail(
  id: string
): Promise<ListingDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as JoinedListing;
  return {
    ...rowToItem(row),
    photos: row.photos,
    model: row.model ?? undefined,
    quantity: row.quantity,
    esRcd: row.es_rcd ?? false,
    volumenM3: row.volumen_m3 ?? undefined,
    vidaUtilMeses: row.vida_util_meses ?? undefined,
    sellerId: row.user_id,
    cargoCategory: row.cargo_category,
    weightKg: row.weight_kg,
    requiresEquipment: row.requires_equipment ?? [],
    lat: row.lat,
    lng: row.lng,
    pickupDisponible: row.pickup_disponible ?? false,
  };
}

/** Relacionados por categoría (excluyendo el actual). */
export async function fetchRelated(
  category: Database["public"]["Enums"]["listing_category"],
  excludeId: string,
  limit = 4
): Promise<CatalogItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(limit);
  if (error || !data) return [];
  return (data as unknown as JoinedListing[]).map(rowToItem);
}

/**
 * Incrementa views_count. Usa service role (RLS solo deja UPDATE al owner)
 * — solo se llama desde server components. Best-effort: nunca lanza.
 */
export async function incrementViews(id: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("listings")
      .select("views_count")
      .eq("id", id)
      .maybeSingle();
    if (!data) return;
    await admin
      .from("listings")
      .update({ views_count: (data.views_count ?? 0) + 1 })
      .eq("id", id);
  } catch {
    // métrica best-effort
  }
}

/** Ids de listings favoritos del usuario autenticado (Set vacío si anónimo). */
export async function fetchFavoriteIds(): Promise<Set<string>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id);
  return new Set((data ?? []).map((f) => f.listing_id));
}

/** Listings guardados (favorites → listings activos) del usuario. */
export async function fetchSavedListings(): Promise<CatalogItem[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("favorites")
    .select(`listing:listings!favorites_listing_id_fkey(${LISTING_SELECT})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as { listing: JoinedListing | null }[])
    .map((f) => f.listing)
    .filter((l): l is JoinedListing => Boolean(l && l.status === "active"))
    .map(rowToItem);
}

/** Anuncios del proveedor autenticado (todos los status). */
export async function fetchMyListings(): Promise<ListingRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}
