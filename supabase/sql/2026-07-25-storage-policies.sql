-- ============================================================================
-- Remnak · Políticas de Storage (buckets creados vía API el 2026-07-25)
-- Ejecutar COMPLETO en: Supabase Dashboard → SQL Editor → Run
--
-- Contexto: los buckets descritos en CLAUDE.md NO existían en el proyecto;
-- se crearon vía API admin: listing-photos (público, 8MB, imágenes) y
-- verification-docs (privado, 10MB, imágenes+PDF). Sin estas políticas,
-- los uploads desde la app (fotos de anuncios, fotos de vehículos y
-- documentos del fletero) fallan con RLS.
--
-- Regla de carpeta: cada usuario escribe SOLO bajo {su_uid}/... en ambos
-- buckets (CLAUDE.md). service_role no necesita políticas (bypassa RLS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- listing-photos (lectura pública; escritura por carpeta propia)
-- La lectura pública vía URL /object/public/ no requiere política; esta
-- SELECT permite además listar/descargar por API autenticada.
-- ----------------------------------------------------------------------------
drop policy if exists "listing_photos_select" on storage.objects;
create policy "listing_photos_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_insert_own" on storage.objects;
create policy "listing_photos_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "listing_photos_update_own" on storage.objects;
create policy "listing_photos_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "listing_photos_delete_own" on storage.objects;
create policy "listing_photos_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- verification-docs (privado: cada quien SOLO su carpeta; admin via
-- service_role — sin acceso anon)
-- ----------------------------------------------------------------------------
drop policy if exists "verification_docs_select_own" on storage.objects;
create policy "verification_docs_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "verification_docs_insert_own" on storage.objects;
create policy "verification_docs_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "verification_docs_update_own" on storage.objects;
create policy "verification_docs_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "verification_docs_delete_own" on storage.objects;
create policy "verification_docs_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- Verificación (opcional): debe listar 8 políticas storage.objects
-- ----------------------------------------------------------------------------
-- select policyname from pg_policies
--   where schemaname = 'storage' and tablename = 'objects'
--   and policyname like '%photos%' or policyname like '%verification_docs%';
