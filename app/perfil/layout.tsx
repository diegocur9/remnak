import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/shared/site-header";
import { getSessionProfile } from "@/lib/auth/profile";

/** /perfil es para CUALQUIER rol autenticado (a diferencia de cuenta/panel). */
export default async function PerfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getSessionProfile();
  if (!profile) redirect("/login?redirect=/perfil");

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
