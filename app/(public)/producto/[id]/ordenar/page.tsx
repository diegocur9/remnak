import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { OrderCheckoutForm } from "@/components/marketplace/order-checkout-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchListingDetail } from "@/lib/marketplace/queries";
import { getCompatibleCarriers } from "@/lib/queries/vehicles";
import { vehicleTypeLabel } from "@/lib/marketplace/freight";
import { getSessionProfile } from "@/lib/auth/profile";

export const metadata: Metadata = { title: "Crear orden" };

export default async function OrdenarPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { qty?: string };
}) {
  const { profile } = await getSessionProfile();
  if (!profile) redirect(`/login?redirect=/producto/${params.id}/ordenar`);

  const listing = await fetchListingDetail(params.id);
  if (!listing) notFound();

  if (profile.verification_status !== "verified") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-advertencia/15 text-advertencia">
              <ShieldAlert className="h-7 w-7" />
            </span>
            <div className="space-y-1">
              <h1 className="font-display text-2xl tracking-tight text-ink">
                Verificación pendiente
              </h1>
              <p className="max-w-sm text-sm text-texto-suave">
                Para comprar en Remnak necesitas una cuenta verificada. Estamos
                revisando tus datos — te avisaremos al aprobarse.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/producto/${params.id}`}>Volver al anuncio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (listing.sellerId === profile.id) {
    redirect(`/producto/${params.id}`);
  }

  const rawQty = Math.max(1, Math.floor(Number(searchParams.qty) || 1));
  const isRental = listing.priceType === "renta_diaria";
  // Venta: no más unidades que las del lote. Renta: qty = días (tope 90).
  const qty = isRental ? Math.min(rawQty, 90) : Math.min(rawQty, listing.quantity);

  // Fleteros compatibles para LO COMPRADO (venta escala; renta viaja completo).
  let carrierOptions: {
    vehicleId: string;
    label: string;
    carrierName: string;
    rating: number;
    distanceKm: number | null;
    trips: number;
    fleteTotal: number;
  }[] = [];
  if (listing.flete && listing.cargoCategory && listing.weightKg) {
    const cargoQty = isRental ? listing.quantity : qty;
    const scale = listing.quantity > 0 ? cargoQty / listing.quantity : 1;
    const matches = await getCompatibleCarriers({
      cargoCategory: listing.cargoCategory,
      weightKg: listing.unitWeightKg
        ? listing.unitWeightKg * cargoQty
        : listing.weightKg * scale,
      totalVolumeM3:
        listing.cargoVolumeM3Total != null
          ? listing.cargoVolumeM3Total * scale
          : null,
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
    carrierOptions = matches.map((m) => ({
      vehicleId: m.vehicle.id,
      label:
        vehicleTypeLabel(m.vehicle.vehicle_type) +
        (m.vehicle.alias ? ` · ${m.vehicle.alias}` : ""),
      carrierName: m.carrier.full_name ?? "Fletero Remnak",
      rating: Math.round((m.carrier.rating_avg ?? 0) * 10) / 10,
      distanceKm: m.distanceKm,
      trips: m.tripPlan.trips,
      fleteTotal: listing.fletePrice * m.tripPlan.trips,
    }));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        href={`/producto/${listing.id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-texto-suave hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al anuncio
      </Link>
      <OrderCheckoutForm
        listing={{
          id: listing.id,
          title: listing.title,
          price: listing.price,
          unit: listing.unit,
          quantity: listing.quantity,
          isRental,
          pickupDisponible: listing.pickupDisponible,
          fleteDisponible: listing.flete,
          seller: listing.seller,
        }}
        qty={qty}
        carrierOptions={carrierOptions}
      />
    </div>
  );
}
