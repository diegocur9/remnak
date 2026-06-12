import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { SearchBar } from "@/components/shared/search-bar";
import { UserMenu } from "@/components/shared/user-menu";
import { getSessionProfile } from "@/lib/auth/profile";
import { homeForProfile, isProviderSide } from "@/lib/auth/routes";

export async function SiteHeader() {
  const { profile } = await getSessionProfile();
  const provider = isProviderSide(profile);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Logo size="md" className="shrink-0" />

        <div className="hidden flex-1 md:block">
          <SearchBar className="max-w-xl" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {profile ? (
            <>
              <Button asChild variant="default" size="sm" className="hidden sm:inline-flex">
                <Link href={provider ? "/panel/publicar" : "/panel"}>
                  <Plus />
                  Publicar
                </Link>
              </Button>
              <UserMenu
                fullName={profile.full_name}
                home={homeForProfile(profile)}
                isProvider={provider}
              />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/register">
                  <Plus className="hidden sm:block" />
                  Publicar
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Buscador a ancho completo en móvil. */}
      <div className="border-t border-border px-4 py-2 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
