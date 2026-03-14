UPDATE public.works
SET limit_type = 'sentence'
WHERE limit_type IN ('character', '1 kí tự', '1 câu');

CREATE OR REPLACE FUNCTION public.validate_contribution()
RETURNS TRIGGER AS $$
DECLARE
    rule TEXT;
    work_sub_category TEXT;
    work_owner_id UUID;
BEGIN
    -- Preserve the existing bypass for system-generated contributions.
    IF NEW.author_nickname = 'Hệ thống' THEN
        RETURN NEW;
    END IF;

    SELECT w.limit_type, w.sub_category, w.created_by
    INTO rule, work_sub_category, work_owner_id
    FROM public.works AS w
    WHERE w.id = NEW.work_id;

    -- Read-only prose categories only allow the work owner to create contributions.
    -- Scope this to INSERT so nickname sync updates on existing rows continue to work.
    IF TG_OP = 'INSERT'
       AND work_sub_category IN ('Nhật ký (chỉ xem)', 'Hồi ký (chỉ xem)')
       AND NEW.user_id IS DISTINCT FROM work_owner_id THEN
        RAISE EXCEPTION 'Mục này ở chế độ chỉ xem. Chỉ chủ tác phẩm mới có thể đóng góp.';
    END IF;

    IF rule = 'sentence' OR rule = '1 câu' THEN
        IF NOT (trim(NEW.content) ~ '[.!?…]$') THEN
            RAISE EXCEPTION 'Quy tắc "1 câu": Câu phải kết thúc bằng dấu câu (. ! ? …).';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;