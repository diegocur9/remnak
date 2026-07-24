"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Loader2, Pause, Pencil, Play } from "lucide-react";
import { toast } from "sonner";

import { setListingStatusAction } from "@/app/(proveedor)/panel/actions";

/** Pausar/reactivar + editar, por fila de "Mis anuncios". */
export function ListingRowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const canToggle = status === "active" || status === "paused";

  function toggle() {
    const next = status === "active" ? "paused" : "active";
    startTransition(async () => {
      const result = await setListingStatusAction(id, next);
      if (result.error) toast.error(result.error);
      else toast.success(next === "paused" ? "Anuncio pausado" : "Anuncio activo");
    });
  }

  return (
    <span className="flex items-center justify-end gap-1">
      {canToggle && (
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          title={status === "active" ? "Pausar" : "Reactivar"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-secondary hover:text-ink disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "active" ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      )}
      <Link
        href={`/panel/publicar?id=${id}`}
        title="Editar"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-secondary hover:text-ink"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    </span>
  );
}
