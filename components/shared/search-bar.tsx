"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Buscador del header. Envía a /buscar?q=… (catálogo). Estilo del design file:
 * píldora blanca, borde cálido, hover naranja, atajo ⌘K.
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
        className="pointer-events-none absolute left-[14px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#B0A599]"
        strokeWidth={2.2}
        aria-hidden
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cemento, varilla, minicargador…"
        aria-label="Buscar materiales y maquinaria"
        className="h-10 w-full rounded-[11px] border border-[#E6DED4] bg-white pl-10 pr-14 text-[13.5px] text-ink ring-offset-background placeholder:text-[#9C9085] focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-[5px] border border-[#E6DED4] px-[5px] py-[2px] font-mono text-[10px] text-[#C3B8AC] sm:block">
        ⌘K
      </span>
    </form>
  );
}
