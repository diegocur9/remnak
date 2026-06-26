import Link from "next/link";
import { Plus } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { SearchBar } from "@/components/shared/search-bar";
import { UserMenu } from "@/components/shared/user-menu";
import { getSessionProfile } from "@/lib/auth/profile";
import { homeForProfile, isProviderSide } from "@/lib/auth/routes";

/** Botón "Vender / Publicar": fondo ink, ícono naranja (estilo design file). */
function InkCta({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-[38px] items-center gap-[7px] rounded-[10px] bg-ink px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-night"
    >
      <Plus className="h-[15px] w-[15px] text-[#F89357]" strokeWidth={2.3} />
      {label}
    </Link>
  );
}

export async function SiteHeader() {
  const { profile } = await getSessionProfile();
  const provider = isProviderSide(profile);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EAE3DA] bg-canvas/[0.86] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-5 px-4 sm:px-[26px]">
        <Logo size="md" priority className="shrink-0" />

        <div className="hidden flex-1 md:block">
          <SearchBar className="max-w-[440px]" />
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-[14px]">
          {profile ? (
            <>
              {provider && (
                <span className="hidden sm:block">
                  <InkCta href="/panel/publicar" label="Publicar" />
                </span>
              )}
              <UserMenu
                fullName={profile.full_name}
                home={homeForProfile(profile)}
                isProvider={provider}
              />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13.5px] font-semibold text-ink hover:text-brand-strong"
              >
                Iniciar sesión
              </Link>
              <InkCta href="/register" label="Vender" />
            </>
          )}
        </div>
      </div>

      {/* Buscador a ancho completo en móvil. */}
      <div className="border-t border-[#EAE3DA] px-4 py-2 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
