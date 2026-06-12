import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { getSessionProfile } from "@/lib/auth/profile";
import { homeForProfile, isProviderSide } from "@/lib/auth/routes";

export default async function ProveedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getSessionProfile();
  if (!profile) redirect("/login?redirect=/panel");
  if (!isProviderSide(profile)) redirect(homeForProfile(profile));

  const verificado = profile.verification_status === "verified";

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      {!verificado && (
        <div className="border-b border-advertencia/40 bg-advertencia/10">
          <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 text-sm sm:px-6">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-advertencia" />
            <p className="text-ink">
              <span className="font-semibold">Verificación pendiente.</span>{" "}
              Puedes preparar tu inventario, pero{" "}
              <span className="font-semibold">
                no podrás publicar hasta que validemos tu cuenta
              </span>
              . Sube tus documentos para acelerar el proceso.
            </p>
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
