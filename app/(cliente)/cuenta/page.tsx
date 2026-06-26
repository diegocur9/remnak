import type { Metadata } from "next";

import { ClientOrders } from "@/components/marketplace/client-orders";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SAVED_LISTING_IDS } from "@/lib/marketplace/dashboard";
import { getSampleListing, toCardView } from "@/lib/marketplace/catalog";
import { getSessionProfile } from "@/lib/auth/profile";

export const metadata: Metadata = { title: "Mis compras" };

export default async function CuentaPage() {
  const { profile } = await getSessionProfile();
  const nombre = profile?.full_name ?? "Tu cuenta";
  const municipio = profile?.municipio ?? "México";

  const saved = SAVED_LISTING_IDS.map(getSampleListing).filter(
    (l): l is NonNullable<typeof l> => Boolean(l)
  );

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
              $4,082.40
            </div>
          </div>
          <div className="rounded-[13px] border border-[#ECE4DB] bg-white px-[18px] py-3">
            <div className="mb-0.5 text-xs text-[#8B8178]">Órdenes activas</div>
            <div className="font-mono text-[17px] font-bold text-ink">1</div>
          </div>
        </div>
      </div>

      <ClientOrders />

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
