"use client";

import type { ReactNode } from "react";

/**
 * Providers globales del cliente.
 * Aquí se montarán: TanStack Query, ThemeProvider, Toaster, etc.
 * Por ahora pasa children sin envolver para no agregar peso innecesario.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
