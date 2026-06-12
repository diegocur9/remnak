import Link from "next/link";

import { Logo } from "@/components/shared/logo";
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
      <footer className="border-t border-[#EFE8DE]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <Logo size="sm" href={null} />
            <span className="text-[13px] text-[#A1968B]">
              · Marketplace de construcción · México
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/privacidad"
              className="text-[13px] text-texto-suave hover:text-ink"
            >
              Aviso de privacidad
            </Link>
            <span className="font-mono text-[11.5px] text-[#B4A99D]">
              LFPDPPP · CFDI 4.0 · Escrow Stripe / Mercado Pago
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
