DROP POLICY IF EXISTS "Site media read" ON storage.objects;

CREATE POLICY "Published site media read" ON storage.objects
FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'site-media'
  AND (
    CASE WHEN auth.uid() IS NULL THEN false ELSE public.has_role(auth.uid(), 'admin') END
    OR name IN (
      SELECT path FROM (
        SELECT content->>'heroImage' AS path FROM public.site_settings WHERE id = 'main'
        UNION ALL
        SELECT content->>'logoImage' FROM public.site_settings WHERE id = 'main'
      ) referenced
      WHERE path IS NOT NULL AND path <> '' AND path NOT LIKE 'https://%'
    )
  )
);