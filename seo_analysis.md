# Phân tích & Tối ưu hóa SEO - Đồng ngôn

Tài liệu này đánh giá hiện trạng SEO của website và cung cấp các quy tắc chuẩn dựa trên hướng dẫn của Google để cải thiện khả năng hiển thị và thứ hạng tìm kiếm.

---

## 1. Đánh giá hiện trạng (Audit Kết quả hiện tại)

Qua kiểm tra các file `layout.tsx`, `page.tsx` và `metadata.md`, tôi phát hiện các vấn đề sau:

### ✅ Điểm tốt:
- Đã có cấu hình **Structured Data (JSON-LD)** đầy đủ cho WebSite, Organization và Breadcrumb.
- Sử dụng **Canonical URL** để tránh nội dung trùng lặp.
- Đã cài đặt xác minh **Google Search Console**.
- Có cơ chế **Dynamic SEO** cho từng tác phẩm.

### ❌ Các điểm cần sửa ngay:
1. **Sự không nhất quán về Tiêu đề (Title):**
   - Trong `layout.tsx` (mặc định): `"Đồng ngôn - Nhất ngôn xuất, vạn kiếp hồi thanh"`
   - Trong `page.tsx` (trang chủ): `"Đồng ngôn - Cùng nhau tạo nên những tác phẩm văn học tuyệt vời"`
   - **Vấn đề:** Google khuyến khích sự thống nhất. Tiêu đề trang chủ hiện tại (~62 ký tự) hơi dài, có nguy cơ bị cắt bỏ khi hiển thị trên di động.
2. **Mô tả (Meta Description) quá dài:**
   - Hiện tại: `~200 ký tự`.
   - **Vấn đề:** Google thường chỉ hiển thị khoảng **155-160 ký tự**. Phần mô tả hiện tại rất thơ mộng nhưng phần quan trọng nhất (thông tin về nền tảng) có thể bị cắt mất.
3. **Thẻ Keywords (Từ khóa) không còn hiệu lực:**
   - Bạn đang dùng mảng `keywords` trong metadata.
   - **Sự thật:** Google đã chính thức xác nhận **không sử dụng meta keywords** để xếp hạng từ cách đây nhiều năm. Việc nhồi nhét từ khóa ở đây không giúp ích gì.

---

## 2. Bộ quy tắc chuẩn SEO (Tham khảo Google Search Central)

### 🏷️ Tiêu đề (Page Titles / Title Tags)
Google sử dụng tiêu đề để hiểu nội dung trang và hiển thị làm "Title Link" trong kết quả tìm kiếm.
- **Độ dài lý tưởng:** 50 - 60 ký tự (tránh bị cắt `...`).
- **Cấu trúc khuyến nghị:** `[Tên Trang] | [Tên Thương Hiệu]` hoặc `[Tên Thương Hiệu] - [Slogan ngắn gọn]`.
- **Quy tắc:**
    - Phải là duy nhất cho mỗi trang.
    - Đặt từ khóa quan trọng lên đầu.
    - Không viết hoa toàn bộ (All Caps).
    - Tránh dùng các từ vô nghĩa như "Trang chủ", "Untitled".

### 📝 Mô tả (Meta Descriptions)
Nội dung này đóng vai trò là "lời chào mời" để người dùng click vào trang (CTR).
- **Độ dài lý tưởng:** 140 - 160 ký tự.
- **Quy tắc:**
    - Phải chứa lời kêu gọi hành động (CTA) như: "Khám phá ngay", "Tham gia sáng tác", "Tìm hiểu thêm".
    - Phải tóm tắt chính xác nội dung trang đó.
    - Tránh trùng lặp mô tả giữa các trang khác nhau.
- **Lưu ý:** Google có thể tự viết lại mô tả nếu họ thấy nội dung trong trang khớp với truy vấn của người dùng hơn.

### 🗝️ Từ khóa (Keywords)
- **Quy tắc:** Không tập trung vào thẻ metadata keywords. 
- **Thay thế:** Lồng ghép từ khóa một cách tự nhiên vào thẻ tiêu đề chính (**H1**), đoạn văn đầu tiên, và thuộc tính `alt` của hình ảnh.

---

## 3. Đề xuất chỉnh sửa trực tiếp

| Thành phần | Hiện tại | Đề xuất tối ưu | Lý do |
| :--- | :--- | :--- | :--- |
| **Title (Trang chủ)** | Đồng ngôn - Cùng nhau tạo nên những tác phẩm văn học tuyệt vời | **Đồng ngôn | Nền tảng sáng tác văn học cộng đồng** | Ngắn gọn (48 ký tự), chứa từ khóa mạnh. |
| **Description** | Nhất ngôn xuất, vạn kiếp hồi thanh - Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai... | **Đồng ngôn là nơi những tâm hồn văn chương cùng nhau sáng tác. Nơi chữ chồng lên chữ, hồn chất lên hồn. Khám phá kho tàng tác phẩm cộng đồng ngay!** | 158 ký tự. Đủ ý, có CTA, chứa từ khóa "sáng tác", "văn chương". |

---
*Tài liệu được phân tích bởi Antigravity dựa trên tiêu chuẩn Google Search Central 2025.*
