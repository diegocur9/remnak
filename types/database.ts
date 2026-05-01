/**
 * Tipos generados de Supabase. Reemplaza este archivo con el output de:
 *   supabase gen types typescript --project-id <PROJECT_ID> > types/database.ts
 *
 * Por ahora dejamos un stub vacío para que los clientes Supabase compilen.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
