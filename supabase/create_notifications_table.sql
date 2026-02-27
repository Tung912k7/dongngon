CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_id uuid REFERENCES public.works(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('contribution', 'announcement', 'system')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Turn on RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update only their own notifications (for marking as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert notifications (e.g., when they contribute)
CREATE POLICY "Authenticated users can trigger notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
