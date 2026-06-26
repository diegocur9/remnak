import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Publicar anuncio" };

export default function PublicarPage() {
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
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <PackagePlus className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <h1 className="font-display text-2xl tracking-tight text-ink">
              Publicar anuncio
            </h1>
            <p className="max-w-sm text-sm text-texto-suave">
              El formulario de publicación (fotos, categoría, condición, precio,
              flete y RCD) llega en la próxima iteración.
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
