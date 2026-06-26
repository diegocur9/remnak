"use client";

import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import type { ListingActionKind } from "@/lib/marketplace/catalog";

const PENDING_MESSAGE: Record<
  ListingActionKind,
  { title: string; description: string }
> = {
  comprar: {
    title: "Checkout con escrow",
    description: "El flujo de pago en escrow llega en la próxima iteración.",
  },
  rentar: {
    title: "Renta con escrow",
    description: "El flujo de renta con escrow llega en la próxima iteración.",
  },
  ofertar: {
    title: "Subasta",
    description: "Las pujas en tiempo real llegan en la próxima iteración.",
  },
  contratar: {
    title: "Contratación",
    description: "La contratación de profesionales llega en la próxima iteración.",
  },
  flete: {
    title: "Solicitud de flete",
    description: "La solicitud de fletes llega en la próxima iteración.",
  },
};

export function ProductPurchasePanel({
  priceMain,
  priceSuffix,
  unit,
  locationLabel,
  ctaLabel,
  ctaKind,
}: {
  priceMain: string;
  priceSuffix: string;
  unit: string;
  locationLabel: string;
  ctaLabel: string;
  ctaKind: ListingActionKind;
}) {
  const [qty, setQty] = useState(1);
  // Servicios y fletes se cotizan por unidad, no por cantidad.
  const showQty = ctaKind === "comprar" || ctaKind === "rentar";

  return (
    <div className="rounded-[18px] border border-[#ECE4DB] bg-white p-[22px] shadow-[0_12px_30px_rgba(41,35,31,.07)]">
      <div className="mb-[3px] flex items-baseline gap-[7px]">
        <span className="font-mono text-[32px] font-bold tabular-nums text-ink">
          {priceMain}
        </span>
        {priceSuffix && (
          <span className="text-sm font-semibold text-[#8B8178]">{priceSuffix}</span>
        )}
      </div>
      <div className="mb-[18px] text-[13px] text-[#8B8178]">
        {unit} · {locationLabel}
      </div>

      {showQty && (
        <div className="mb-4 flex items-center justify-between border-y border-[#F2ECE4] py-[11px]">
          <span className="text-[13.5px] font-semibold text-[#5A524B]">
            {ctaKind === "rentar" ? "Días" : "Cantidad"}
          </span>
          <div className="flex items-center gap-0.5 rounded-[10px] bg-[#F6F1EA] p-[3px]">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Disminuir"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,.06)]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-mono text-[15px] font-bold text-ink">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              aria-label="Aumentar"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,.06)]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          const m = PENDING_MESSAGE[ctaKind];
          toast(m.title, { description: m.description });
        }}
        className="mb-2.5 h-[50px] w-full rounded-xl bg-brand text-base font-extrabold text-white shadow-[0_6px_16px_rgba(242,107,44,.32)] transition-colors hover:bg-[#E0571B]"
      >
        {ctaLabel}
      </button>
      <button
        type="button"
        onClick={() => toast.success("Guardado en tus favoritos")}
        className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#E6DED4] bg-white text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand-strong"
      >
        <Heart className="h-[17px] w-[17px]" strokeWidth={2.1} />
        Guardar
      </button>
    </div>
  );
}
