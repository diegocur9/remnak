"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { sendMessageAction } from "@/app/ordenes/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

/**
 * Chat regulado dentro de la orden (decisión ratificada: NO hay chat
 * pre-compra). Se muestra content_clean; los mensajes bloqueados se ocultan.
 * Realtime vía postgres_changes (RLS: solo participantes reciben).
 */
export function OrderChat({
  orderId,
  meId,
  initialMessages,
  closed,
}: {
  orderId: string;
  meId: string;
  initialMessages: MessageRow[];
  closed: boolean;
}) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row]
          );
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    const result = await sendMessageAction(orderId, value);
    if (result?.error) {
      // Aviso de moderación o suspensión — el mensaje filtrado sí se envía
      // salvo suspensión; refrescamos por si realtime no lo trae a tiempo.
      toast.warning(result.error);
    }
    setText("");
    setSending(false);
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#ECE4DB] bg-white">
      <div className="flex items-center justify-between border-b border-[#F2ECE4] px-4 py-3">
        <h2 className="font-display text-[15px] text-ink">Chat de la orden</h2>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-texto-suave">
          <ShieldAlert className="h-3 w-3" />
          Moderado — sin datos de contacto
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex h-72 flex-col gap-2 overflow-y-auto bg-canvas/50 px-4 py-3"
      >
        {messages.length === 0 && (
          <p className="m-auto text-center text-[13px] text-texto-suave">
            Coordina aquí la entrega. Los datos de contacto se comparten al
            concluir la transacción.
          </p>
        )}
        {messages.map((m) => {
          const own = m.sender_id === meId;
          return (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug",
                own
                  ? "self-end rounded-br-md bg-brand text-white"
                  : "self-start rounded-bl-md border border-[#ECE4DB] bg-white text-ink"
              )}
            >
              {m.blocked ? (
                <span className={cn("italic", own ? "text-white/80" : "text-texto-suave")}>
                  Mensaje bloqueado (dato de contacto no permitido)
                </span>
              ) : (
                (m.content_clean ?? m.content)
              )}
              {m.flagged && !m.blocked && (
                <span
                  className={cn(
                    "mt-0.5 block text-[10px]",
                    own ? "text-white/70" : "text-texto-suave"
                  )}
                >
                  filtrado por moderación
                </span>
              )}
            </div>
          );
        })}
      </div>

      {closed ? (
        <p className="border-t border-[#F2ECE4] px-4 py-3 text-center text-[12.5px] text-texto-suave">
          El chat de esta orden está cerrado.
        </p>
      ) : (
        <div className="flex items-center gap-2 border-t border-[#F2ECE4] p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            maxLength={1000}
            placeholder="Escribe un mensaje…"
            className="h-10 flex-1 rounded-full border border-[#E6DED4] bg-white px-4 text-sm text-ink outline-none placeholder:text-[#9C9085] focus:border-brand"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || !text.trim()}
            aria-label="Enviar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-[#E0571B] disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
