-- ============================================================================
-- Remnak · Fix de permisos DB (aprobado 2026-07-25)
-- Ejecutar COMPLETO en: Supabase Dashboard → SQL Editor → Run
--
-- Corrige dos hallazgos verificados en vivo:
--   (1) service_role sin GRANTs en las tablas → el cliente admin del
--       servidor (lib/supabase/admin.ts) no puede leer/escribir nada.
--   (2) Agujero RLS: un usuario autenticado puede UPDATE su propio
--       profiles.verification_status a 'verified' (auto-verificación),
--       inflar rating_avg/rating_count y otras columnas sensibles.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- (1) GRANTs para service_role
-- service_role ya tiene BYPASSRLS; solo le faltan los privilegios de tabla.
-- ----------------------------------------------------------------------------
grant usage on schema public to service_role;

grant select, insert, update, delete
  on all tables in schema public
  to service_role;

-- Tablas que se creen en el futuro heredan los mismos privilegios.
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;

-- Por si alguna tabla futura usa secuencias:
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;

-- ----------------------------------------------------------------------------
-- (2) Protección de columnas sensibles en profiles
--
-- Estrategia: trigger BEFORE UPDATE que, cuando el UPDATE viene DIRECTO del
-- API como anon/authenticated (pg_trigger_depth() = 1), revierte en silencio
-- las columnas sensibles al valor anterior. Escrituras internas de otros
-- triggers (p. ej. on_review_created actualizando rating_avg, depth > 1) y
-- las de service_role / postgres pasan sin tocar.
--
-- Además: intento de escalar role a 'admin' (o meter 'admin' en
-- secondary_roles) → EXCEPCIÓN dura, venga de donde venga salvo
-- service_role/postgres.
-- ----------------------------------------------------------------------------
create or replace function public.protect_profile_sensitive_columns()
returns trigger
language plpgsql
as $$
begin
  -- Solo aplica a peticiones directas del API con rol de usuario final.
  if pg_trigger_depth() = 1
     and current_user in ('anon', 'authenticated') then

    -- Escalada de privilegios: bloqueo duro.
    if (new.role = 'admin' and old.role is distinct from 'admin')
       or ('admin' = any(coalesce(new.secondary_roles, '{}'))
           and not ('admin' = any(coalesce(old.secondary_roles, '{}')))) then
      raise exception 'No autorizado: no puedes asignarte rol admin';
    end if;

    -- Verificación KYC: solo admin/service_role la cambia.
    new.verification_status := old.verification_status;
    new.verified_at         := old.verified_at;
    new.verified_by         := old.verified_by;

    -- Reputación y contadores: los mantienen los triggers del sistema.
    new.rating_avg      := old.rating_avg;
    new.rating_count    := old.rating_count;
    new.total_purchases := old.total_purchases;
    new.total_sales     := old.total_sales;

    -- Créditos de referidos: dinero, solo backend.
    new.referral_credit_mxn := old.referral_credit_mxn;
    new.referred_by         := coalesce(old.referred_by, new.referred_by);
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_sensitive_columns on public.profiles;

create trigger protect_profile_sensitive_columns
  before update on public.profiles
  for each row
  execute function public.protect_profile_sensitive_columns();

-- ----------------------------------------------------------------------------
-- Verificación rápida (opcional, debe devolver el trigger y 4+ privilegios):
-- ----------------------------------------------------------------------------
-- select tgname from pg_trigger
--   where tgrelid = 'public.profiles'::regclass and not tgisinternal;
-- select privilege_type from information_schema.role_table_grants
--   where grantee = 'service_role' and table_name = 'profiles';
