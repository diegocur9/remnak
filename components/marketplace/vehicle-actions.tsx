"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteVehicle, toggleVehicleActive } from "@/lib/actions/vehicles";

/** Pausar/reactivar · editar · eliminar, por tarjeta de vehículo. */
export function VehicleActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canToggle = status === "verified" || status === "inactive";

  function toggle() {
    startTransition(async () => {
      const r = await toggleVehicleActive(id);
      if (r.error) toast.error(r.error);
      else
        toast.success(
          status === "verified" ? "Vehículo pausado" : "Vehículo activo de nuevo"
        );
    });
  }

  function remove() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    startTransition(async () => {
      const r = await deleteVehicle(id);
      if (r.error) toast.error(r.error);
      else if (r.soft)
        toast("Vehículo pausado", {
          description:
            "Tiene viajes registrados, así que se conserva el historial y quedó pausado.",
        });
      else toast.success("Vehículo eliminado");
      setConfirmDelete(false);
    });
  }

  return (
    <div className="flex items-center gap-1">
      {canToggle && (
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          title={status === "verified" ? "Pausar" : "Reactivar"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-secondary hover:text-ink disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "verified" ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      )}
      <Link
        href={`/logistica/vehiculos/${id}/editar`}
        title="Editar"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-secondary hover:text-ink"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        title={confirmDelete ? "Confirmar eliminación" : "Eliminar"}
        className={
          confirmDelete
            ? "flex h-9 items-center gap-1.5 rounded-lg bg-error px-2.5 text-xs font-bold text-white"
            : "flex h-9 w-9 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
        }
      >
        <Trash2 className="h-4 w-4" />
        {confirmDelete && "¿Seguro?"}
      </button>
    </div>
  );
}
