import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/shared/site-header";
import { getSessionProfile, hasRole } from "@/lib/auth/profile";
import { homeForProfile } from "@/lib/auth/routes";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getSessionProfile();
  if (!profile) redirect("/login?redirect=/cuenta");
  // Multi-rol: solo bloquea a quien NO es cliente (ni primario ni secundario).
  if (!hasRole(profile, "cliente")) redirect(homeForProfile(profile));

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
