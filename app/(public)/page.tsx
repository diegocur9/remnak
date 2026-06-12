import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { CategoryIcon } from "@/components/marketplace/category-icon";
import { ListingCard } from "@/components/marketplace/listing-card";
import {
  FEATURED_LISTINGS,
  HOME_CATEGORIES,
  toCardView,
} from "@/lib/marketplace/catalog";

export default function HomePage() {
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="overflow-hidden border-b border-[#EFE8DE] bg-[linear-gradient(180deg,#FDFAF6_0%,#FBF5ED_100%)]">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 py-14 lg:grid-cols-[1.04fr_.96fr] lg:px-8 lg:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FBEADF] px-3 py-1.5 font-mono text-xs font-medium text-brand-strong">
              <span className="h-[7px] w-[7px] rounded-full bg-[#1F8A4C]" />
              Campeche · Mérida — piloto activo
            </div>
            <h1 className="mb-[18px] font-display text-[44px] leading-[.98] tracking-[-.02em] text-ink sm:text-[62px]">
              Nada
              <br />
              sobra.
            </h1>
            <p className="mb-[26px] max-w-[430px] text-[18.5px] leading-[1.5] text-[#6B6259]">
              Compra y renta materiales, maquinaria y fletes para construcción.
              Sobrantes, liquidaciones y defectuosos con{" "}
              <strong className="text-ink">pago protegido en escrow</strong>.
            </p>

            <form
              action="/buscar"
              className="flex max-w-[480px] items-center gap-2 rounded-[14px] border border-[#E6DED4] bg-white p-[7px] shadow-[0_10px_30px_rgba(41,35,31,.07)]"
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap border-r border-[#ECE4DB] px-3 text-[13.5px] font-semibold text-[#6B6259]">
                Todo
                <ChevronDown className="h-[13px] w-[13px] text-[#B0A599]" strokeWidth={2.4} />
              </span>
              <input
                name="q"
                placeholder="¿Qué necesitas para tu obra?"
                aria-label="Buscar en el catálogo"
                className="min-w-0 flex-1 border-none bg-transparent text-[14.5px] text-ink outline-none placeholder:text-[#9C9085]"
              />
              <button
                type="submit"
                className="inline-flex h-[42px] items-center gap-[7px] rounded-[10px] bg-brand px-5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(242,107,44,.32)] transition-colors hover:bg-[#E0571B]"
              >
                <Search className="h-4 w-4" strokeWidth={2.4} />
                Buscar
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-[22px]">
              <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#4A423B]">
                <ShieldCheck className="h-[17px] w-[17px] text-[#1F8A4C]" strokeWidth={2.1} />
                Pago en escrow
              </span>
              <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#4A423B]">
                <Check className="h-[17px] w-[17px] rounded-full bg-brand/10 p-px text-brand" strokeWidth={3} />
                Proveedores verificados
              </span>
              <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#4A423B]">
                <ArrowRight className="h-[17px] w-[17px] text-[#9A6B0E]" strokeWidth={2.1} />
                Comisión 12%
              </span>
            </div>
          </div>

          {/* Visual del hero */}
          <div className="relative">
            <div className="rounded-[22px] border border-[#ECE4DB] bg-white p-[14px] shadow-[0_30px_60px_rgba(41,35,31,.12)]">
              <div className="flex h-[330px] items-end rounded-[14px] bg-[repeating-linear-gradient(135deg,#EFE7DD,#EFE7DD_13px,#E9E0D5_13px,#E9E0D5_26px)] p-[14px]">
                <span className="rounded-md bg-white/70 px-2 py-[3px] font-mono text-[11px] text-[#9A8F84]">
                  obra_peninsula.jpg
                </span>
              </div>
            </div>
            <div className="absolute -left-[18px] -top-[14px] flex items-center gap-[9px] rounded-[13px] border border-[#ECE4DB] bg-white px-[14px] py-[11px] shadow-[0_14px_30px_rgba(41,35,31,.13)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#E7F4EC]">
                <ShieldCheck className="h-5 w-5 text-[#1F8A4C]" strokeWidth={2.3} />
              </span>
              <div className="leading-[1.25]">
                <div className="text-xs text-[#8B8178]">Escrow liberado</div>
                <div className="font-mono text-sm font-bold text-ink">$18,400.00</div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-[14px] flex items-center gap-[9px] rounded-[13px] bg-night px-[15px] py-[11px] text-white shadow-[0_14px_30px_rgba(41,35,31,.22)]">
              <span className="h-[9px] w-[9px] rounded-full bg-brand shadow-[0_0_0_4px_rgba(242,107,44,.25)]" />
              <div className="leading-[1.25]">
                <div className="text-xs text-[#A99E92]">En camino · flete asignado</div>
                <div className="text-[13.5px] font-bold">Mérida → obra · 2.4 km</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Categorías ===== */}
      <section className="mx-auto max-w-[1180px] px-6 pb-1.5 pt-10 lg:px-8">
        <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-6">
          {HOME_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/buscar?categoria=${c.value}`}
              className="flex flex-col items-center gap-[11px] rounded-[18px] border border-[#ECE4DB] bg-white px-2.5 py-5 transition duration-150 hover:-translate-y-[3px] hover:border-[#E0D6CB] hover:shadow-[0_14px_28px_rgba(41,35,31,.09)]"
            >
              <CategoryIcon category={c.value} />
              <span className="text-[13.5px] font-bold text-ink">{c.label}</span>
              <span className="font-mono text-[11px] text-[#A1968B]">{c.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Destacados ===== */}
      <section className="mx-auto max-w-[1180px] px-6 pb-2 pt-10 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="mb-1.5 font-mono text-xs font-medium tracking-[.04em] text-brand-strong">
              DESTACADOS
            </div>
            <h2 className="font-display text-[28px] tracking-[-.01em] text-ink">
              Esta semana en la Península
            </h2>
          </div>
          <Link
            href="/buscar"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-strong"
          >
            Ver catálogo
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_LISTINGS.map((it) => (
            <ListingCard key={it.id} it={toCardView(it)} />
          ))}
        </div>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section className="mt-[54px] bg-night text-[#F3ECE3]">
        <div className="mx-auto max-w-[1180px] px-6 py-14 lg:px-8">
          <div className="mb-2.5 font-mono text-xs font-medium tracking-[.06em] text-[#F89357]">
            CÓMO FUNCIONA
          </div>
          <h2 className="mb-2 max-w-[620px] font-display text-[34px] tracking-[-.01em] text-white">
            Pago protegido, de principio a fin
          </h2>
          <p className="mb-9 max-w-[560px] text-base text-[#A99E92]">
            El dinero queda retenido en escrow hasta que confirmas que recibiste
            tu material. Sin sorpresas, sin fugas.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="rounded-2xl border border-[#3A322C] bg-[#2B2521] p-[22px]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl shadow-[0_6px_14px_rgba(224,87,27,.35)]"
                    style={{
                      background: s.done
                        ? "linear-gradient(145deg,#2FA866,#1F8A4C)"
                        : "linear-gradient(145deg,#F58440,#E0571B)",
                    }}
                  >
                    <s.icon className="h-[22px] w-[22px] text-white" strokeWidth={2.3} />
                  </span>
                  <span className="font-mono text-[13px] text-[#5E544C]">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mb-1.5 text-base font-bold text-white">{s.title}</h3>
                <p className="text-[13.5px] leading-[1.5] text-[#A99E92]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const STEPS = [
  {
    icon: Search,
    title: "Encuentra y compra",
    body: "Materiales verificados con foto, condición y ubicación reales.",
    done: false,
  },
  {
    icon: ShieldCheck,
    title: "Tu pago entra a escrow",
    body: "Retenemos el monto 7 días. El proveedor lo ve, pero no lo cobra aún.",
    done: false,
  },
  {
    icon: Truck,
    title: "Recibe y confirma",
    body: "Flete dentro de la plataforma. Confirmas la recepción con un toque.",
    done: false,
  },
  {
    icon: Check,
    title: "Liberamos al proveedor",
    body: "Comisión 12% transparente y CFDI 4.0 emitido automáticamente.",
    done: true,
  },
] as const;
