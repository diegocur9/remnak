import { STEP_NAMES } from "@/lib/marketplace/dashboard";
import { cn } from "@/lib/utils";

/** Barra de progreso 1..5 (Pagado → Completado). step 0 = sin arrancar. */
export function OrderTimeline({ step }: { step: number }) {
  const done = step >= 5;
  return (
    <div>
      <div className="flex gap-[5px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= step ? (done ? "bg-[#1F8A4C]" : "bg-brand") : "bg-[#EEE6DC]"
            )}
          />
        ))}
      </div>
      {step > 0 && (
        <div className="mt-1.5 text-[12.5px] font-bold text-ink">
          {STEP_NAMES[step - 1]}
        </div>
      )}
    </div>
  );
}
