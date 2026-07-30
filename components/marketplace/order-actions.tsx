"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Package, Truck, X } from "lucide-react";
import { toast } from "sonner";

import {
  advanceOrderAction,
  cancelOrderAction,
  confirmReceiptAction,
  simulatePaymentAction,
} from "@/app/ordenes/actions";
import { Button } from "@/components/ui/button";

function useAct() {
  const [isPending, startTransition] = useTransition();
  const run = (fn: () => Promise<{ error?: string }>, ok?: string) =>
    startTransition(async () => {
      const r = await fn();
      if (r?.error) toast.error(r.error);
      else if (ok) toast.success(ok);
    });
  return { isPending, run };
}

function CancelButton({ orderId }: { orderId: string }) {
  const { isPending, run } = useAct();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        <X />
        Cancelar orden
      </Button>
    );
  }
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() =>
        run(() => cancelOrderAction(orderId, "Cancelada por el usuario"), "Orden cancelada")
      }
    >
      {isPending ? <Loader2 className="animate-spin" /> : <X />}
      Confirmar cancelación
    </Button>
  );
}

/** Acciones del COMPRADOR según status. */
export function BuyerOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const { isPending, run } = useAct();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "pending" && (
        <>
          <Button
            disabled={isPending}
            onClick={() =>
              run(
                () => simulatePaymentAction(orderId),
                "Pago registrado — escrow iniciado (72 h)"
              )
            }
          >
            {isPending && <Loader2 className="animate-spin" />}
            Marcar como pagado (acordado con el vendedor)
          </Button>
          <CancelButton orderId={orderId} />
        </>
      )}
      {(status === "delivered" || status === "in_transit") && (
        <Button
          className="bg-[#1F8A4C] hover:bg-[#1A7641]"
          disabled={isPending}
          onClick={() =>
            run(
              () => confirmReceiptAction(orderId),
              "Recepción confirmada — escrow liberado"
            )
          }
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Check />}
          Confirmar recepción
        </Button>
      )}
    </div>
  );
}

/** Acciones del VENDEDOR según status. */
export function SellerOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const { isPending, run } = useAct();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "pending" && <CancelButton orderId={orderId} />}
      {status === "paid" && (
        <Button
          disabled={isPending}
          onClick={() =>
            run(() => advanceOrderAction(orderId, "confirmed"), "Orden confirmada")
          }
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Check />}
          Confirmar orden
        </Button>
      )}
      {status === "confirmed" && (
        <Button
          disabled={isPending}
          onClick={() =>
            run(() => advanceOrderAction(orderId, "in_transit"), "Marcada en camino")
          }
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Truck />}
          En camino
        </Button>
      )}
      {status === "in_transit" && (
        <Button
          disabled={isPending}
          onClick={() =>
            run(() => advanceOrderAction(orderId, "delivered"), "Marcada como entregada")
          }
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Package />}
          Marcar entregada
        </Button>
      )}
    </div>
  );
}
