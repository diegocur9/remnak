import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/profile";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const { profile } = await getSessionProfile();
  const nombre = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-ink">
          Hola{nombre ? `, ${nombre}` : ""} 👋
        </h1>
        <p className="mt-1 text-texto-suave">
          Tu cuenta de comprador en Remnak.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <PackageSearch className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <p className="font-semibold text-ink">Aún no tienes compras</p>
            <p className="text-sm text-texto-suave">
              Explora materiales, maquinaria y liquidaciones cerca de tu obra.
            </p>
          </div>
          <Button asChild>
            <a href="/buscar">Explorar el marketplace</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
