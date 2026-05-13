-- 1. Hàm xử lý thông báo khi có đóng góp mới
CREATE OR REPLACE FUNCTION public.handle_new_contribution()
RETURNS TRIGGER AS $$
DECLARE
    work_title TEXT;
    work_owner UUID;
BEGIN
    -- Lấy thông tin tác phẩm
    SELECT title, created_by INTO work_title, work_owner 
    FROM public.works 
    WHERE id = NEW.work_id;

    -- A. Thông báo cho Chủ sở hữu (nếu người đóng góp không phải chủ sở hữu)
    IF work_owner != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, work_id, type, content)
        VALUES (
            work_owner,
            NEW.work_id,
            'contribution',
            NEW.author_nickname || ' đã đóng góp một câu mới vào tác phẩm "' || work_title || '" của bạn.'
        );
    END IF;

    -- B. Thông báo cho những người đã đóng góp trước đó (ngoại trừ chủ sở hữu và chính người vừa đóng góp)
    -- Giới hạn thông báo để tránh spam nếu tác phẩm quá hot
    INSERT INTO public.notifications (user_id, work_id, type, content)
    SELECT DISTINCT user_id, NEW.work_id, 'engagement', 
           'Tác phẩm "' || work_title || '" mà bạn từng tham gia vừa có thêm nội dung mới.'
    FROM public.contributions
    WHERE work_id = NEW.work_id 
      AND user_id != NEW.user_id 
      AND user_id != work_owner
      AND created_at < NEW.created_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tạo Trigger
DROP TRIGGER IF EXISTS on_contribution_created ON public.contributions;
CREATE TRIGGER on_contribution_created
    AFTER INSERT ON public.contributions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_contribution();
