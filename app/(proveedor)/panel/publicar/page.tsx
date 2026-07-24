import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/profile";
import type { ListingInput } from "@/lib/validations/listing";
import type { MUNICIPIOS } from "@/lib/constants";
import { PublishForm } from "./publish-form";

export const metadata: Metadata = { title: "Publicar anuncio" };

export default async function PublicarPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const { profile } = await getSessionProfile();
  // El layout ya garantiza sesión + rol de oferta.
  if (!profile) return null;

  if (profile.verification_status !== "verified") {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href="/panel"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-texto-suave hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-advertencia/15 text-advertencia">
              <ShieldAlert className="h-7 w-7" />
            </span>
            <div className="space-y-1">
              <h1 className="font-display text-2xl tracking-tight text-ink">
                Verificación pendiente
              </h1>
              <p className="max-w-sm text-sm text-texto-suave">
                Para publicar necesitas una cuenta verificada. Estamos revisando
                tus datos; te avisaremos al aprobarse.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/panel">Volver al panel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Modo edición: carga el anuncio del propio proveedor.
  let listingId: string | undefined;
  let defaults: Partial<ListingInput> | undefined;
  if (searchParams.id) {
    const supabase = createClient();
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("id", searchParams.id)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!data) notFound();
    listingId = data.id;
    defaults = {
      title: data.title,
      description: data.description ?? "",
      category: data.category,
      condition: data.condition,
      priceType:
        data.price_type === "renta_diaria" ? "renta_diaria" : "fijo",
      priceMxn: data.price_mxn,
      quantity: data.quantity,
      unit: data.unit ?? "",
      brand: data.brand ?? "",
      model: data.model ?? "",
      municipio: (data.municipio ?? undefined) as
        | (typeof MUNICIPIOS)[number]
        | undefined,
      fleteDisponible: data.flete_disponible ?? false,
      fletePrecioMxn: data.flete_precio_mxn ?? undefined,
      pickupDisponible: data.pickup_disponible ?? true,
      esRcd: data.es_rcd ?? false,
      volumenM3: data.volumen_m3 ?? undefined,
      photos: data.photos,
      status: data.status === "draft" ? "draft" : "active",
    };
  }

  return (
    <PublishForm userId={profile.id} listingId={listingId} defaults={defaults} />
  );
}
