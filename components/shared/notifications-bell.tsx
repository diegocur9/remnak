"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell } from "lucide-react";

import { markNotificationsReadAction } from "@/app/ordenes/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from "@/types/database";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

/** Link destino según el tipo/rol; las de orden van al detalle correcto. */
function targetFor(n: NotificationRow, isProvider: boolean): string {
  const data = (n.data ?? {}) as Record<string, string>;
  if (data.order_id) {
    if (n.type === "flete") return "/logistica/viajes";
    return isProvider && n.type !== "chat_buyer"
      ? `/panel/ordenes/${data.order_id}`
      : `/cuenta/ordenes/${data.order_id}`;
  }
  return isProvider ? "/panel" : "/cuenta";
}

export function NotificationsBell({
  items,
  unread,
  isProvider,
}: {
  items: NotificationRow[];
  unread: number;
  isProvider: boolean;
}) {
  const [count, setCount] = useState(unread);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && count > 0) {
          setCount(0);
          void markNotificationsReadAction();
        }
      }}
    >
      <DropdownMenuTrigger
        aria-label="Notificaciones"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 font-mono text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-[12.5px] text-texto-suave">
            Sin notificaciones todavía.
          </p>
        ) : (
          items.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link
                href={targetFor(n, isProvider)}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-bold text-ink">
                    {n.title}
                  </span>
                  {!n.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                  )}
                </span>
                {n.body && (
                  <span className="line-clamp-1 text-xs text-texto-suave">
                    {n.body}
                  </span>
                )}
                <span className="text-[10.5px] text-[#A89E94]">
                  {timeAgo(n.created_at)}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
