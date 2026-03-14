-- Add welcome acknowledgement column to profiles table
ALTER TABLE public.profiles
	ADD COLUMN IF NOT EXISTS has_acknowledged_welcome_message BOOLEAN NOT NULL DEFAULT FALSE;
