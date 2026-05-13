# 📝 Nhật ký cập nhật hệ thống Đồng ngôn

Tài liệu này liệt kê các thay đổi quan trọng để người dùng/tester có thể kiểm tra thủ công.

## 1. Tính năng Lưu tác phẩm (Bookmarking) — ✅ HOÀN THÀNH
- **File sửa đổi:** `components/SaveWorkButton.tsx`, `actions/save-work.ts`, `app/work/[id]/page.tsx`.
- **Nội dung thay đổi:**
    - Triển khai **Optimistic UI**: Khi click vào icon trái tim, trạng thái sẽ thay đổi ngay lập tức trên giao diện mà không cần đợi server phản hồi (tạo cảm giác mượt mà).
    - Khắc phục lỗi crash do xung đột giữa `motion` và `LazyMotion` (đã chuyển về dùng `m.div`).
    - Thêm logic tự động đồng bộ trạng thái khi điều hướng hoặc tải lại trang.
- **Cách kiểm tra:**
    1. Đăng nhập vào hệ thống.
    2. Truy cập [Kho tàng](/kho-tang) hoặc trang chi tiết tác phẩm.
    3. Click vào icon trái tim. Icon phải đổi màu đỏ ngay lập tức.
    4. Nếu có lỗi mạng, hệ thống sẽ tự động hoàn tác (rollback) trạng thái và hiển thị thông báo lỗi.

## 2. Hiển thị Hồ sơ cá nhân (Profile) — ✅ HOÀN THÀNH
- **File sửa đổi:** `app/profile/page.tsx`, `components/WorkLibraryItem.tsx`.
- **Nội dung thay đổi:**
    - Sửa logic truy vấn dữ liệu từ Supabase: Đảm bảo lấy đúng thông tin tác phẩm thông qua bảng trung gian `saved_works` bằng lệnh join `work:works (*)`.
    - Robust Mapping: Xử lý linh hoạt trường hợp dữ liệu trả về dạng mảng hoặc đối tượng đơn lẻ từ Supabase.
    - Truyền trạng thái `initialSaved={true}` cho các item trong mục "TÁC PHẨM ĐÃ LƯU".
- **Cách kiểm tra:**
    1. Sau khi lưu một tác phẩm, truy cập trang [Hồ sơ cá nhân](/profile).
    2. Kiểm tra mục **"TÁC PHẨM ĐÃ LƯU"**. Tác phẩm bạn vừa lưu phải xuất hiện tại đây với icon trái tim đỏ.

## 3. Hệ thống thông báo (Notifications) — ✅ HOÀN THÀNH
- **File sửa đổi:** `actions/notification.ts`, `app/notification/page.tsx`, `.agent/scripts/notifications_trigger.sql`.
- **Nội dung thay đổi:**
    - Kích hoạt **SQL Triggers** tự động: Khi có người dùng đóng góp vào tác phẩm mà bạn đã lưu (saved_works), hệ thống sẽ tự động tạo thông báo.
    - Infrastructure: Hệ thống Server Actions và giao diện hiển thị thông báo đã sẵn sàng và đồng bộ với database.
- **Cách kiểm tra:**
    1. Dùng tài khoản A lưu tác phẩm "Cố Hương".
    2. Dùng tài khoản B viết thêm một câu đóng góp cho "Cố Hương".
    3. Đăng nhập lại tài khoản A, kiểm tra biểu tượng thông báo trên thanh điều hướng. Thông báo mới phải xuất hiện tại đó và trong trang [/notification](/notification).

## 4. Tối ưu hiệu năng & Cuộn vô hạn (Infinite Scroll) — ✅ HOÀN THÀNH
- **File sửa đổi:** `components/Feed.tsx`, `actions/contribute.ts`.
- **Nội dung thay đổi:**
    - Sử dụng thư viện `react-virtuoso` để render danh sách đóng góp. Chỉ render các phần tử đang hiển thị trên màn hình (Virtualization), giúp trang cực kỳ mượt mà dù tác phẩm có hàng nghìn câu.
    - Phân trang dữ liệu (Chunk loading): Mỗi lần cuộn xuống chỉ tải thêm 50 câu mới từ Server Action `getContributionsChunk`.
- **Cách kiểm tra:**
    1. Truy cập một tác phẩm có nhiều nội dung (ví dụ: các tác phẩm có > 100 câu).
    2. Cuộn xuống dưới cùng của danh sách. Quan sát quá trình tải thêm dữ liệu tự động.

---
**Ghi chú:** Mọi thay đổi đã được xác nhận hoạt động ổn định với tài khoản test: `test@dongngon.com`.
