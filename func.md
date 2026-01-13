# Các Chức Năng Của Website Đồng Ngôn

Tài liệu này tổng hợp toàn bộ các chức năng cốt lõi và lộ trình phát triển của website Đồng Ngôn.

## 1. Chức Năng Cốt Lõi (Core Features)

### ✍️ Sáng Tác & Lưu Trữ
- **Lưu trữ ngẫu hứng:** Nơi lưu trữ các đoạn thơ, văn xuôi ngẫu hứng cá nhân.
- **Sáng tác tập thể (Collaborative Writing):**
    - **Thơ:** Hỗ trợ nhiều thể loại (Tự do, Lục bát, Song thất lục bát, Thất ngôn tứ tuyệt, Thất ngôn bát cú).
    - **Văn xuôi:** Tản văn, Truyện ngắn.
    - **Tiểu thuyết:** (Chức năng sắp ra mắt).
- **Chế độ đóng góp "Tiếp sức":**
    - **Logic giới hạn:** 1 ký tự/ngày hoặc 1 câu/ngày cho mỗi bài viết.
    - **Real-time Feed:** Hiển thị nội dung mới ngay lập tức (Real-time) khi có người đóng góp mà không cần tải lại trang.
    - **Bộ đếm:** Hỗ trợ đếm ký tự hoặc câu trong khung nhập liệu.

### 👤 Quản Lý Người Dùng & Ẩn Danh
- **Hệ thống Bút danh (Nickname):** Mỗi người dùng sử dụng một bút danh riêng biệt để đóng góp, đảm bảo tính ẩn danh hoặc bản sắc riêng.
- **Quyền sở hữu:** Nội dung là tài sản chung của cộng đồng, không thuộc sở hữu riêng của bất kỳ cá nhân nào (kể cả admin).

## 2. Quản Trị & Kiểm Duyệt (Community & Moderation)

### 🗳️ Hệ Thống Biểu Quyết (Voting)
- **Vote Kết thúc:** Người dùng có thể biểu quyết để kết thúc một tác phẩm.
- **Tự động hoàn thành:** Khi đủ số phiếu bầu, hệ thống tự động:
    - Chèn thẻ `[Hết]` vào cuối tác phẩm.
    - Chuyển trạng thái bài viết sang "Read-only" (Chỉ đọc).

### 🛡️ An Toàn Nội Dung
- **Bộ lọc từ khóa (Blacklist):** Tự động lọc các từ ngữ vi phạm thuần phong mỹ tục.
- **Quy tắc cộng đồng:** Cấm các nội dung xuyên tạc, bịa đặt, chống phá hoặc vi phạm pháp luật.

## 3. Cá Nhân Hóa & Riêng Tư (Privacy & Personalization)

- **Private Mode (Chế độ Riêng tư):** Khu vực dành riêng cho các cặp đôi hoặc nhóm nhỏ, chỉ những người được cấp quyền mới có thể đọc và viết.
- **Bộ lọc & Tìm kiếm:**
    - Lọc theo thể loại (Thơ, Văn, Tiểu thuyết).
    - Lọc theo thời kỳ (Cổ đại, Trung đại, Hiện đại).

## 4. Công Nghệ & Hiệu Năng (Tech & Performance)

- **Công nghệ chính:** Next.js (Frontend), Supabase (Backend & Realtime).
- **Tối ưu SEO:** Sử dụng cơ chế ISR (Incremental Static Regeneration) giúp nội dung hiển thị tức thì và thân thiện với công cụ tìm kiếm.
- **Bảo mật & Sao lưu:** Dữ liệu được tự động sao lưu hàng ngày.

---
*Dựa trên kế hoạch phát triển và tài liệu dự án hiện tại.*
