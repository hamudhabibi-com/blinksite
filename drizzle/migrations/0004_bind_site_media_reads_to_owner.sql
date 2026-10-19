DROP POLICY IF EXISTS "Published site media read" ON storage.objects;

CREATE POLICY "Site media owner or admin read" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'site-media'
  AND (
    owner = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  )
);