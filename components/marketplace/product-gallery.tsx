"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { isOptimizedHost } from "@/components/marketplace/listing-card";
import { cn } from "@/lib/utils";

/**
 * Galería del producto: imagen principal + miniaturas seleccionables.
 * Con `photos` reales renderiza next/image; sin fotos usa el placeholder
 * rayado del design file.
 */
export function ProductGallery({
  photos,
  photoLabel,
  catLabel,
  title,
}: {
  photos: string[];
  photoLabel: string;
  catLabel: string;
  title: string;
}) {
  const hasPhotos = photos.length > 0;
  const placeholderLabels = useMemo(() => {
    const base = photoLabel.replace(/\.jpg$/i, "");
    return [photoLabel, `${base}_2.jpg`, `${base}_detalle.jpg`, `${base}_obra.jpg`];
  }, [photoLabel]);
  const count = hasPhotos ? photos.length : placeholderLabels.length;
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative flex h-[420px] items-end overflow-hidden rounded-[18px] border border-[#ECE4DB] bg-[repeating-linear-gradient(135deg,#EFE7DD,#EFE7DD_14px,#E8DFD4_14px,#E8DFD4_28px)] p-4">
        {hasPhotos && (
          <Image
            src={photos[Math.min(active, photos.length - 1)] ?? photos[0]!}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            unoptimized={!isOptimizedHost(photos[Math.min(active, photos.length - 1)] ?? "")}
          />
        )}
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white px-[11px] py-[5px] text-xs font-bold text-ink shadow-[0_2px_6px_rgba(41,35,31,.10)]">
          {catLabel}
        </span>
        {!hasPhotos && (
          <span className="rounded-md bg-white/[0.74] px-2 py-[3px] font-mono text-[11px] text-[#9A8F84]">
            {placeholderLabels[active]}
          </span>
        )}
      </div>
      {count > 1 || !hasPhotos ? (
        <div className="mt-3 flex gap-2.5">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={cn(
                "relative h-[72px] flex-1 overflow-hidden rounded-[10px] border-2 bg-[repeating-linear-gradient(135deg,#EFE7DD,#EFE7DD_9px,#E7DED3_9px,#E7DED3_18px)] transition-colors",
                i === active ? "border-brand" : "border-transparent hover:border-[#E0D6CB]"
              )}
            >
              {hasPhotos ? (
                <Image
                  src={photos[i]!}
                  alt={`${title} — foto ${i + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                  unoptimized={!isOptimizedHost(photos[i]!)}
                />
              ) : (
                <span className="absolute bottom-1 left-[5px] rounded-[4px] bg-white/70 px-1 py-px font-mono text-[8.5px] text-[#9A8F84]">
                  {placeholderLabels[i]}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
