# Tính năng ẩn người dùng (Thao tác qua Database)

## Goal
Cho phép ẩn một người dùng bằng cách cập nhật dữ liệu trực tiếp trong database (Supabase). Khi người dùng bị ẩn (`is_hidden = true`), toàn bộ tác phẩm và hồ sơ (profile) của họ sẽ biến mất khỏi Kho tàng, không thể tìm kiếm, và không cho phép người khác truy cập.

## Tasks
- [ ] Task 1: Tạo Supabase migration thêm cột `is_hidden` (boolean, default false) vào bảng `public.profiles`. → Verify: Cột `is_hidden` tồn tại trong database.
- [ ] Task 2: Cập nhật kiểu dữ liệu `Profile` trong `types/database.ts` để bổ sung trường `is_hidden?: boolean`. → Verify: Typescript nhận diện thuộc tính `is_hidden` trên object `Profile`.
- [ ] Task 3: Cập nhật `app/kho-tang/page.tsx` để lọc bỏ các tác phẩm và kết quả tìm kiếm của tác giả có `is_hidden = true`. (Cần join với bảng `profiles` khi gọi API query works). → Verify: Sửa `is_hidden` thành `true` trên DB, tải lại trang Kho tàng, tác phẩm của user đó không còn xuất hiện.
- [ ] Task 4: Chặn truy cập trang Profile (`app/profile/page.tsx`) nếu `is_hidden = true` (chỉ cho phép Admin hoặc chính chủ xem), render UI báo "Không tìm thấy hồ sơ". → Verify: Truy cập URL profile của user bị ẩn bằng account thường sẽ báo lỗi Không tìm thấy/404.
- [ ] Task 5: Chặn truy cập trang chi tiết tác phẩm (`app/work/[id]/page.tsx`) nếu tác giả bị ẩn (chỉ cho phép Admin hoặc chính chủ xem). → Verify: Truy cập URL tác phẩm của user ẩn báo lỗi tương tự.

## Done When
- [ ] Tính năng ẩn chỉ thực hiện thông qua việc thay đổi thủ công cột `is_hidden` trực tiếp trong Database (Supabase Dashboard).
- [ ] Tác phẩm của người dùng bị ẩn hoàn toàn biến mất khỏi Kho tàng và ô tìm kiếm đối với người dùng thông thường/khách.
- [ ] Các URL trực tiếp dẫn tới Profile và Tác phẩm của user bị ẩn sẽ bị vô hiệu hóa với người lạ.
