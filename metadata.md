# Quản lý Metadata & SEO - Đồng ngôn

Tài liệu này tổng hợp tất cả các thành phần metadata (thẻ meta, OpenGraph, JSON-LD) đang được sử dụng và cấu hình tĩnh trên trang web của dự án để bạn có thể quản lý, kiểm duyệt và chỉnh sửa.

## 1. Global Metadata (Áp dụng chung toàn bộ trang - `app/layout.tsx`)

Những thông tin này hiển thị ở mọi trang trừ khi bị ghi đè bởi trang cụ thể:

*   **Tên trang (Title template):** `%s | Đồng ngôn`
*   **Tiêu đề mặc định (Default Title):** Đồng ngôn - Nhất ngôn xuất, vạn kiếp hồi thanh
*   **Mô tả (Description):** Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai. Tại nơi đây, chữ chồng lên chữ, hồn chất lên hồn, sinh nghệ thuật.
*   **Từ khóa (Keywords):** `thơ văn`, `ngẫu hứng`, `sáng tác`, `văn học`, `đồng ngôn`, `tâm hồn`, 'kho tàng', 'thơ tự do', 'văn chương'
*   **Tác giả (Authors / Creator / Publisher):** Đồng ngôn
*   **URL Cơ sở (MetadataBase):** `https://dongngon.vercel.app`
*   **Canonical URL:** `/`
*   **Xác minh Google (Google Site Verification):** `ka9n2768UYd1YIxNC96kuOCvTBP6MfVqmUyFHRxSOvw`
*   **Robots:** Index = true, Follow = true

### Open Graph (Hiển thị khi Share link lên Facebook, Zalo,...)
*   **OG Title:** Đồng ngôn
*   **OG Description:** Nhất ngôn xuất, vạn kiếp hồi thanh
*   **OG Image:** `/webp%20file/logo.webp` (Kích thước: 800x600)
*   **Site Name:** Đồng ngôn
*   **Locale:** `vi_VN`
*   **Type:** `website`

### Twitter Card
*   **Card Type:** `summary_large_image`
*   **Twitter Title:** Đồng ngôn
*   **Twitter Description:** Nhất ngôn xuất, vạn kiếp hồi thanh
*   **Twitter Image:** `/webp%20file/logo.webp`

### Schema.org (Cấu trúc JSON-LD khai báo với Search Engine)
*   **Kiểu dữ liệu (Type):** `WebSite` & `Organization`
*   **Hộp tìm kiếm (Sitelinks Searchbox):** Tìm kiếm tự động chuyển hướng đến `/kho-tang?query={search_term}`
*   **Logo Tổ chức:** `https://dongngon.vercel.app/webp%20file/logo.webp`

---

## 2. Trang chủ (`app/page.tsx`)

Metadata trang chủ ghi đè lên Global Metadata để nhấn mạnh vào cộng đồng và lời kêu gọi hành động.

*   **Tiêu đề (Title):** Đồng ngôn - Nhất ngôn xuất, vạn kiếp hồi thanh
*   **Mô tả (Description):** Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai. Tại nơi đây, chữ chồng lên chữ, hồn chất lên hồn, sinh nghệ thuật.
*   **OG Title:** Đồng ngôn - Nhất ngôn xuất, vạn kiếp hồi thanh
*   **OG Description:** Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai. Tại nơi đây, chữ chồng lên chữ, hồn chất lên hồn, sinh nghệ thuật.

---

## 3. Trang Kho tàng Tác phẩm (`app/kho-tang/page.tsx`)

*   **Tiêu đề (Title):** Đồng ngôn - Kho tàng tác phẩm
*   **Mô tả (Description):** Mỗi một tác phẩm là một hạt giống đang chờ bạn vun trồng. Triệu hạt giống tạo nên cánh đồng văn học bạt ngàn và vô tận.

---

## 4. Các trang Hệ thống / Xác thực

*   **Quên mật khẩu (`app/quen-mat-khau/page.tsx`):**
    *   **Title:** Quên mật khẩu
    *   **Description:** Lấy lại mật khẩu tài khoản.
*   **Đổi mật khẩu (`app/account/reset-password/page.tsx`):**
    *   **Title:** Đổi mật khẩu
    *   **Description:** Cập nhật mật khẩu mới cho tài khoản.
