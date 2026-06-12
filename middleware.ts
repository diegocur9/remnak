import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";
import {
  AUTH_ONLY_PREFIXES,
  CLIENTE_HOME,
  PROTECTED_PREFIXES,
  PROVEEDOR_HOME,
  homeForProfile,
  isProviderSide,
} from "@/lib/auth/routes";
import { hasRole } from "@/lib/auth/roles";

function startsWithAny(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);
  const isAuthOnly = startsWithAny(pathname, AUTH_ONLY_PREFIXES);

  // Sin sesión en ruta protegida → al login (guardando destino).
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Con sesión en /login o /register → a su home.
  if (user && isAuthOnly) {
    const url = request.nextUrl.clone();
    url.pathname = CLIENTE_HOME;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Guards de rol (multi-rol: rol primario O secondary_roles).
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, secondary_roles")
      .eq("id", user.id)
      .single();

    const inProveedor = startsWithAny(pathname, [PROVEEDOR_HOME]);
    const inCliente = startsWithAny(pathname, [CLIENTE_HOME]);

    // Redirige siempre al home propio del usuario para no provocar bucles.
    const denied =
      (inProveedor && !isProviderSide(profile)) ||
      (inCliente && !hasRole(profile, "cliente"));

    if (denied) {
      const home = homeForProfile(profile);
      if (home !== pathname && !startsWithAny(pathname, [home])) {
        const url = request.nextUrl.clone();
        url.pathname = home;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Todo excepto estáticos de Next, favicon, el logo y archivos con
     * extensión. Así el middleware refresca sesión en páginas y rutas API.
     */
    "/((?!_next/static|_next/image|favicon.ico|remnak-logo.png|.*\\.[\\w]+$).*)",
  ],
};
