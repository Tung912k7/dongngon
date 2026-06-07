# Sơ đồ trang (Sitemap) — Đồng ngôn

Hệ thống sơ đồ các đường dẫn (routes) và trang chức năng trong dự án **Đồng ngôn**.

---

## 🌐 Các trang Công khai (Public Pages)

| Đường dẫn (Route) | Tên trang         | Đối tượng | Mô tả                                                         |
| :---------------- | :---------------- | :-------- | :------------------------------------------------------------ | --- |
| `/`               | Trang chủ         | Tất cả    | Giới thiệu dự án, Dòng chảy cảm hứng, và các Tác phẩm đang mở | x   |
| `/kho-tang`       | Kho tàng          | Tất cả    | Danh sách toàn bộ tác phẩm công khai của cộng đồng            | x   |
| `/rankings`       | Bảng Vàng         | Tất cả    | Bảng xếp hạng đóng góp (Ink Points) của các tác giả           | x   |
| `/ve-chung-toi`   | Về chúng tôi      | Tất cả    | Sứ mệnh, triết lý nghệ thuật và tôn chỉ sáng tác              | x   |
| `/work/[id]`      | Chi tiết tác phẩm | Tất cả    | Đọc toàn bộ nội dung tác phẩm và chắp bút (nếu đăng nhập)     | x   |

---

## 📖 Hướng dẫn sử dụng (Help Center / HDSD)

| Đường dẫn (Route)           | Tên trang              | Mô tả                                                                   |
| :-------------------------- | :--------------------- | :---------------------------------------------------------------------- |
| `/hdsd`                     | Sổ tay hướng dẫn       | Trang chủ trợ giúp và tổng hợp giải đáp thắc mắc (FAQ)                  |
| `/hdsd/[section]`           | Danh mục hướng dẫn     | Danh sách bài viết theo chuyên mục (ví dụ: Quy tắc sáng tác, Tài khoản) |
| `/hdsd/[section]/[article]` | Chi tiết bài hướng dẫn | Nội dung chi tiết từng bài viết hướng dẫn sử dụng                       |

---

## 🔒 Tài khoản & Xác thực (Auth & Profile)

| Đường dẫn (Route)         | Tên trang        | Đối tượng        | Mô tả                                                                    |
| :------------------------ | :--------------- | :--------------- | :----------------------------------------------------------------------- | --- |
| `/dang-nhap`              | Đăng nhập        | Khách            | Đăng nhập bằng tài khoản hoặc mã giới hạn                                | x   |
| `/dang-ky`                | Đăng ký          | Khách            | Ghi danh tác giả mới                                                     | x   |
| `/quen-mat-khau`          | Quên mật khẩu    | Khách            | Đặt lại mật khẩu                                                         | x   |
| `/account/reset-password` | Đặt lại mật khẩu | Khách/Thành viên | Trang đặt lại mật khẩu người dùng                                        | x   |
| `/profile`                | Trang cá nhân    | Thành viên       | Xem thông tin tác giả, điểm tích lũy, các tác phẩm và Dấu ấn (Ink Trail) | x   |
| `/settings`               | Cài đặt          | Thành viên       | Chỉnh sửa bút danh, tài khoản và các tùy chọn riêng tư                   | x   |
| `/notification`           | Thông báo        | Thành viên       | Quản lý thông báo hoạt động sáng tác, lượt vote hoặc báo cáo             | x   |

---

## 🛠️ Quản trị (Admin)

| Đường dẫn (Route)  | Tên trang          | Đối tượng | Mô tả                                                               |
| :----------------- | :----------------- | :-------- | :------------------------------------------------------------------ |
| `/admin`           | Tổng quan quản trị | Admin     | Trang chủ quản lý chung tác phẩm, duyệt đóng góp, cấu hình hệ thống |
| `/admin/blacklist` | Danh sách đen      | Admin     | Quản lý shadowban, chặn và hạn chế các tài khoản vi phạm            |
| `/admin/hdsd`      | Quản lý HDSD       | Admin     | Soạn thảo, chỉnh sửa bài viết Sổ tay hướng dẫn sử dụng              |
| `/admin/quotes`    | Quản lý trích dẫn  | Admin     | Quản lý danh sách câu trích dẫn truyền cảm hứng trên Trang chủ      |

---

_Cập nhật lần cuối: 29 tháng 05, 2026._
