-- Migration: Automated Synchronization and Completion
-- This migration adds counters and triggers to ensure data integrity and real-time updates.

-- 1. Add count columns to works
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS contributor_count INTEGER DEFAULT 0;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- 2. Initialize existing counts
UPDATE public.works w
SET 
  contributor_count = (
    SELECT count(DISTINCT user_id) 
    FROM public.contributions 
    WHERE work_id = w.id
  ),
  vote_count = (
    SELECT count(*) 
    FROM public.finish_votes 
    WHERE work_id = w.id
  );

-- 2.1 Finalize works that already reached threshold
UPDATE public.works w
SET status = 'finished'
WHERE status = 'writing' 
  AND vote_count >= GREATEST(1, FLOOR(contributor_count / 2) + 1);

-- 3. Function to update contributor count
CREATE OR REPLACE FUNCTION public.handle_contribution_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.works 
        SET contributor_count = (
            SELECT count(DISTINCT user_id) 
            FROM public.contributions 
            WHERE work_id = NEW.work_id
        )
        WHERE id = NEW.work_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.works 
        SET contributor_count = (
            SELECT count(DISTINCT user_id) 
            FROM public.contributions 
            WHERE work_id = OLD.work_id
        )
        WHERE id = OLD.work_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to update vote count and status
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS TRIGGER AS $$
DECLARE
    v_work_id UUID;
    v_voters INTEGER;
    v_contributors INTEGER;
    v_threshold INTEGER;
    v_status TEXT;
    v_has_marker BOOLEAN;
    v_marker_user_id UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_work_id := NEW.work_id;
        v_marker_user_id := NEW.user_id;
    ELSE
        v_work_id := OLD.work_id;
        v_marker_user_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END IF;

    -- Get current stats
    SELECT 
        status, 
        contributor_count,
        (SELECT count(*) FROM public.finish_votes WHERE work_id = v_work_id)
    INTO v_status, v_contributors, v_voters
    FROM public.works 
    WHERE id = v_work_id;

    -- Update work votes count
    UPDATE public.works SET vote_count = v_voters WHERE id = v_work_id;

    -- Completion Logic
    v_threshold := GREATEST(1, FLOOR(v_contributors / 2) + 1);

    IF v_status = 'writing' AND v_voters >= v_threshold THEN
        -- 1. Update status
        UPDATE public.works SET status = 'finished' WHERE id = v_work_id;
        
        -- 2. Check if marker already exists to avoid duplication
        SELECT EXISTS (
            SELECT 1 FROM public.contributions 
            WHERE work_id = v_work_id AND author_nickname = 'Hệ thống'
        ) INTO v_has_marker;

        -- 3. Add system marker if missing
        IF NOT v_has_marker THEN
            INSERT INTO public.contributions (work_id, user_id, content, author_nickname)
            VALUES (v_work_id, v_marker_user_id, '[Hết] - Tác phẩm đã hoàn thành do cộng đồng bình chọn.', 'Hệ thống');
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach Triggers
DROP TRIGGER IF EXISTS tr_contribution_change ON public.contributions;
CREATE TRIGGER tr_contribution_change
AFTER INSERT OR DELETE ON public.contributions
FOR EACH ROW EXECUTE FUNCTION public.handle_contribution_change();

DROP TRIGGER IF EXISTS tr_vote_change ON public.finish_votes;
CREATE TRIGGER tr_vote_change
AFTER INSERT OR DELETE ON public.finish_votes
FOR EACH ROW EXECUTE FUNCTION public.handle_vote_change();
