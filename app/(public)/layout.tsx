import Link from "next/link";

import { SiteHeader } from "@/components/shared/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-canvas">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-texto-suave sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Remnak · Nada sobra.</p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/privacidad" className="hover:text-ink">
              Aviso de privacidad
            </Link>
            <Link href="/buscar" className="hover:text-ink">
              Explorar
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
