import type { Metadata } from "next";
import { Boxes, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/profile";

export const metadata: Metadata = { title: "Mi panel" };

export default async function PanelPage() {
  const { profile } = await getSessionProfile();
  const nombre = profile?.full_name?.split(" ")[0] ?? "";
  const verificado = profile?.verification_status === "verified";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink">
            Panel{nombre ? ` de ${nombre}` : ""}
          </h1>
          <p className="mt-1 text-texto-suave">
            Gestiona tu inventario y tus ventas.
          </p>
        </div>
        <Button disabled={!verificado} title={!verificado ? "Disponible tras verificación" : undefined}>
          <Plus />
          Publicar
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Boxes className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <p className="font-semibold text-ink">Tu inventario está vacío</p>
            <p className="text-sm text-texto-suave">
              {verificado
                ? "Publica tu primer material o equipo para empezar a vender."
                : "En cuanto verifiquemos tu cuenta podrás publicar tus productos."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
