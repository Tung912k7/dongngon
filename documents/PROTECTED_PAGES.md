# Phân Quyền Truy Cập Trang (Access Control)

Tài liệu này xác định các quy tắc truy cập cho từng trang trên website Đồng Ngôn.

## 1. Trang Công Khai (Public Pages)
Những trang này có thể truy cập được bởi bất kỳ ai (khách vãng lai và người đã đăng nhập).

| Đường dẫn | Mô tả |
|-----------|-------|
| `/` | Trang chủ giới thiệu. |
| `/dong-ngon` | Danh sách các tác phẩm, tìm kiếm và lọc. |
| `/work/[id]` | Nội dung chi tiết của một tác phẩm và dòng thời gian đóng góp. |
| `/dang-nhap` | Trang đăng nhập tài khoản. |
| `/dang-ky` | Trang đăng ký tài khoản mới. |

## 2. Trang Yêu Cầu Đăng Nhập (Authenticated Pages)
Những trang này chỉ dành cho người dùng đã đăng nhập. Nếu truy cập khi chưa đăng nhập, người dùng sẽ bị điều hướng về `/dang-nhap`.

| Đường dẫn | Mô tả |
|-----------|-------|
| `/profile` | Xem hồ sơ cá nhân, các tác phẩm đã tạo và đã đóng góp. |
| `/settings` | Cài đặt tài khoản (đang phát triển). |

## 3. Trang Quản Trị (Admin Pages)
Những trang này chỉ dành cho người dùng có vai trò `admin` trong hệ thống. Nếu không phải admin, người dùng sẽ bị điều hướng về trang chủ `/`.

| Đường dẫn | Mô tả |
|-----------|-------|
| `/admin` | Bảng điều khiển quản trị tổng thể. |
| `/admin/blacklist` | Quản lý danh sách từ ngữ bị cấm. |

## 4. Cơ Chế Thực Thi (Implementation)
- **Middleware**: Sử dụng Next.js Middleware (`middleware.ts`) để kiểm tra session và vai trò người dùng trước khi render trang.
- **Server Actions**: Tất cả các hành động ghi dữ liệu (tạo tác phẩm, đóng góp, cập nhật hồ sơ) đều bắt buộc kiểm tra xác thực ở phía Server.
- **UI/UX**: Ẩn/hiện các nút bấm (như nút "Tạo tác phẩm", "Gửi đóng góp") dựa trên trạng thái đăng nhập để cải thiện trải nghiệm người dùng.
