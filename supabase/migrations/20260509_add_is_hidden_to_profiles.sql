-- Thêm cột is_hidden vào bảng profiles để phục vụ tính năng ẩn người dùng ngầm (Shadowban)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
