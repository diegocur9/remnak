"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { toast } from "sonner";

import {
  CLIENT_ORDERS,
  STEP_NAMES,
  formatMXN,
} from "@/lib/marketplace/dashboard";
import { cn } from "@/lib/utils";

export function ClientOrders() {
  // Override local de "recepción confirmada" por orden.
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  function confirmReceipt(id: string) {
    setConfirmed((c) => ({ ...c, [id]: true }));
    toast.success("Recepción confirmada", {
      description: "Liberamos el escrow al proveedor. ¡Gracias!",
    });
  }

  return (
    <div className="mb-9 flex flex-col gap-4">
      {CLIENT_ORDERS.map((o) => {
        const step = confirmed[o.id] ? 5 : o.step;
        const done = step === 5;
        const showConfirm = step >= 3 && step < 5;

        return (
          <div
            key={o.id}
            className="rounded-[18px] border border-[#ECE4DB] bg-white p-5"
          >
            <div className="flex items-start gap-4">
              <span className="h-[62px] w-[62px] shrink-0 rounded-xl bg-[repeating-linear-gradient(135deg,#EFE7DD,#EFE7DD_8px,#E7DED3_8px,#E7DED3_16px)]" />
              <div className="min-w-0 flex-1">
                <div className="mb-[3px] flex items-center justify-between gap-2.5">
                  <span className="font-mono text-xs text-[#A1968B]">{o.id}</span>
                  <span className="font-mono text-[15px] font-bold text-ink">
                    {formatMXN(o.total)}
                  </span>
                </div>
                <div className="text-[15px] font-bold text-ink">{o.item}</div>
                <div className="mb-3.5 text-[12.5px] text-[#8B8178]">
                  {o.seller}
                </div>

                {/* Timeline de pasos */}
                <div className="mb-2 flex gap-[5px]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        i <= step
                          ? done
                            ? "bg-[#1F8A4C]"
                            : "bg-brand"
                          : "bg-[#EEE6DC]"
                      )}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-ink">
                      {STEP_NAMES[step - 1]}
                    </span>
                    <span
                      className="inline-flex items-center gap-[5px] rounded-full px-2.5 py-[3px] text-[11.5px] font-bold"
                      style={{
                        color: done ? "#1F8A4C" : "#9A6B0E",
                        background: done ? "#E7F4EC" : "#FBF1DA",
                      }}
                    >
                      <Clock className="h-[11px] w-[11px]" strokeWidth={2.3} />
                      {done
                        ? "Escrow liberado al proveedor"
                        : `Escrow se libera en ${o.escrowDays} días`}
                    </span>
                  </div>

                  {showConfirm && (
                    <button
                      type="button"
                      onClick={() => confirmReceipt(o.id)}
                      className="inline-flex h-10 items-center gap-[7px] rounded-[10px] bg-[#1F8A4C] px-[18px] text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(31,138,76,.26)] transition-colors hover:bg-[#1A7641]"
                    >
                      <Check className="h-[15px] w-[15px]" strokeWidth={2.6} />
                      Confirmar recepción
                    </button>
                  )}
                  {done && (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1F8A4C]">
                      <Check className="h-[15px] w-[15px]" strokeWidth={2.6} />
                      Completada
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
