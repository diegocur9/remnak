"use client";

import { useState, useTransition } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import { submitReviewAction } from "@/app/ordenes/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StarPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-semibold text-[#5A524B]">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            aria-label={`${label}: ${i} estrellas`}
            className="p-0.5"
          >
            <Star
              className={cn(
                "h-5 w-5",
                i <= value ? "fill-brand text-brand" : "text-[#D7CCC0]"
              )}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Reseña multidimensión del comprador al completar la orden. */
export function ReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [deliveryTime, setDeliveryTime] = useState(5);
  const [packaging, setPackaging] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-[18px] border border-[#ECE4DB] bg-white p-5 text-center">
        <p className="text-sm font-bold text-exito">¡Gracias por tu reseña!</p>
      </div>
    );
  }

  function submit() {
    startTransition(async () => {
      const r = await submitReviewAction(orderId, {
        rating,
        accuracy,
        deliveryTime,
        packaging,
        comment,
      });
      if (r?.error) toast.error(r.error);
      else {
        toast.success("Reseña publicada");
        setDone(true);
      }
    });
  }

  return (
    <div className="rounded-[18px] border border-[#ECE4DB] bg-white p-5">
      <h2 className="mb-1 font-display text-[15px] text-ink">
        Califica al vendedor
      </h2>
      <p className="mb-4 text-xs text-texto-suave">
        Solo compradores con orden completada pueden reseñar — tu opinión
        define la reputación real.
      </p>
      <div className="space-y-2.5">
        <StarPicker label="General" value={rating} onChange={setRating} />
        <StarPicker label="Exactitud del anuncio" value={accuracy} onChange={setAccuracy} />
        <StarPicker label="Tiempo de entrega" value={deliveryTime} onChange={setDeliveryTime} />
        <StarPicker label="Empaque / condición" value={packaging} onChange={setPackaging} />
      </div>
      <textarea
        rows={2}
        maxLength={600}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentario (opcional)"
        className="mt-3 flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button className="mt-3 w-full" disabled={isPending} onClick={submit}>
        {isPending && <Loader2 className="animate-spin" />}
        Publicar reseña
      </Button>
    </div>
  );
}
