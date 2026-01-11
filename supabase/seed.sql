-- Insert sample works
INSERT INTO public.works (title, status, created_at)
VALUES 
  ('Chuyện Tình Mùa Đông', 'active', NOW()),
  ('Những Ngày Mưa', 'active', NOW()),
  ('Hành Trình Về Phương Đông', 'active', NOW());

-- Optional: Insert a sample contribution
-- INSERT INTO public.contributions (work_id, content, user_id) 
-- VALUES (1, 'Bắt đầu một câu chuyện...', 'USER_UUID_HERE');
