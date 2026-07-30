"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { toggleFavoriteAction } from "@/app/(public)/producto/actions";
import type { ListingActionKind } from "@/lib/marketplace/catalog";
import { cn } from "@/lib/utils";

// Subasta queda post-piloto; el resto de los CTA crean orden real.
const AUCTION_MESSAGE = {
  title: "Subasta",
  description: "Las pujas en tiempo real llegan después del piloto.",
};

export function ProductPurchasePanel({
  listingId,
  priceMain,
  priceSuffix,
  unit,
  locationLabel,
  ctaLabel,
  ctaKind,
  initialSaved,
  isAuthed,
}: {
  listingId: string;
  priceMain: string;
  priceSuffix: string;
  unit: string;
  locationLabel: string;
  ctaLabel: string;
  ctaKind: ListingActionKind;
  initialSaved: boolean;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  // Servicios y fletes se cotizan por unidad, no por cantidad.
  const showQty = ctaKind === "comprar" || ctaKind === "rentar";

  function toggleSaved() {
    if (!isAuthed) {
      router.push(`/login?redirect=/producto/${listingId}`);
      return;
    }
    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSaved(result.saved === true);
      toast.success(
        result.saved ? "Guardado en tus favoritos" : "Quitado de guardados"
      );
    });
  }

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
          if (ctaKind === "ofertar") {
            toast(AUCTION_MESSAGE.title, {
              description: AUCTION_MESSAGE.description,
            });
            return;
          }
          if (!isAuthed) {
            router.push(`/login?redirect=/producto/${listingId}/ordenar`);
            return;
          }
          router.push(`/producto/${listingId}/ordenar?qty=${qty}`);
        }}
        className="mb-2.5 h-[50px] w-full rounded-xl bg-brand text-base font-extrabold text-white shadow-[0_6px_16px_rgba(242,107,44,.32)] transition-colors hover:bg-[#E0571B]"
      >
        {ctaLabel}
      </button>
      <button
        type="button"
        onClick={toggleSaved}
        disabled={isPending}
        className={cn(
          "flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] bg-white text-sm font-bold transition-colors disabled:opacity-60",
          saved
            ? "border-brand text-brand-strong"
            : "border-[#E6DED4] text-ink hover:border-brand hover:text-brand-strong"
        )}
      >
        <Heart
          className={cn("h-[17px] w-[17px]", saved && "fill-brand text-brand")}
          strokeWidth={2.1}
        />
        {saved ? "Guardado" : "Guardar"}
      </button>
    </div>
  );
}
