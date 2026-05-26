-- Secure the notifications insert policy to prevent spoofing/spamming system alerts to non-admin users
DROP POLICY IF EXISTS "Authenticated users can trigger notifications" ON public.notifications;

CREATE POLICY "Authenticated users can trigger notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND (
    type = 'contribution' OR (
      type = 'system' AND EXISTS (
        SELECT 1 FROM public.user_private_data p
        WHERE p.id = user_id AND p.role = 'admin'
      )
    )
  )
);
