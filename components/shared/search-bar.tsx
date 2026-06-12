"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Buscador placeholder del header. Envía a /buscar?q=… (página aún por construir).
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/buscar?q=${encodeURIComponent(term)}` : "/buscar");
      }}
      className={cn("relative w-full", className)}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-suave"
        aria-hidden
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busca cemento, andamios, retroexcavadora…"
        aria-label="Buscar materiales y maquinaria"
        className="h-11 w-full rounded-full border border-input bg-superficie pl-10 pr-4 text-sm text-ink ring-offset-background placeholder:text-texto-suave focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
    </form>
  );
}
