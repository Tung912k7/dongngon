-- Allow authenticated admin users to manage help center articles without requiring a service role key.
-- Keep service role access so existing server-side admin flows continue to work.

DROP POLICY IF EXISTS "Service role write only" ON help_center_articles;
DROP POLICY IF EXISTS "Admin authenticated write" ON help_center_articles;

CREATE POLICY "Service role or admin write"
ON help_center_articles
FOR ALL
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);
