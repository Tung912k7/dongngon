# Project Title: Website [Đồng ngôn]

## Giới thiệu (Description)
Website **Đồng Ngôn** là nơi lưu trữ và chia sẻ cảm hứng văn học.

### Tính năng chính:
1. **Lưu trữ cảm hứng**: Nơi cất giữ những đoạn thơ, văn ngẫu hứng.
2. **Sáng tác tập thể**:
   - **Thơ**: Đa dạng thể loại (Tự do, Lục bát, Song thất lục bát, Thất ngôn tứ tuyệt, Thất ngôn bát cú...).
   - **Văn xuôi**: Tản văn, Truyện ngắn.
   - **Tiểu thuyết**: (Coming soon).
3. **Quy luật cộng đồng**:
   - **Chế độ**: 1 ký tự/bài/ngày hoặc 1 câu/bài/ngày.
   - **Tự do**: Không chủ đề cố định, tôn trọng cảm hứng cá nhân.
   - **Định danh**: Mỗi người dùng có một bút danh (Nickname) riêng.
   - **Bản quyền**: Nội dung là tài sản chung của cộng đồng.
   - **Nguyên tắc**: Nghiêm cấm nội dung xuyên tạc, chống phá, vi phạm pháp luật và thuần phong mỹ tục Việt Nam.
4. **Bộ lọc thông minh**:
   - Lọc theo Thể loại (Thơ/Văn).
   - Lọc theo Thời kỳ (Cổ đại, Trung đại, Cận đại, Hiện đại).

## Hướng dẫn chạy thử (Getting Started)

```bash
# Cài đặt thư viện
npm install

# Chạy server development
npm run dev
# Mở http://localhost:3000 để xem kết quả
```

## Tech Stack (Công nghệ sử dụng)

- **Core**: [Next.js 14+](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: 
  - [Framer Motion](https://www.framer.com/motion/) (Hiệu ứng chuyển cảnh, tương tác)
  - [react-pageflip](https://github.com/Nodlik/react-pageflip) (Hiệu ứng lật trang sách 3D)
- **Utilities**:
  - [react-easy-crop](https://github.com/ValentinH/react-easy-crop) (Cắt ảnh Avatar)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Fonts**: 
  - [Google Fonts](https://fonts.google.com/) (Lora, Geist)
  - Custom Fonts (Roboto Slab Light)

## Cập nhật Kỹ thuật (Technical Highlights)

### Trang Đăng ký (/dang-ky)
- **Thiết kế**: Mô phỏng cuốn sách ma thuật 3D.
- **Công nghệ**: `react-pageflip` kết hợp `framer-motion`.
- **Đặc điểm**:
  - **Hiệu ứng lật trang**: Sách mở từ phải sang trái, bìa sách lật ra sau để lộ trang nội dung.
  - **Layout Thông minh**: 
    - Khi đóng: Bìa sách (Màu đen) được căn giữa màn hình.
    - Khi mở: Sách mở rộng ra 2 bên, tự động căn giữa lại để hiển thị toàn bộ nội dung.
  - **Tương tác**: Các nút điều hướng ("Trang trước", "Bắt Đầu") được tối ưu với lớp Overlay vô hình để đảm bảo nhận diện click chính xác trên bề mặt 3D.
  - **Giao diện**: Màu đen chủ đạo (#1a1a1a), font chữ `Roboto Slab Light` tạo cảm giác cổ điển, trang trọng.

### Trang Đồng Ngôn (/dong-ngon)
- **Giao diện**: Grid Layout responsive, hiển thị tác phẩm dưới dạng thẻ (Card).
- **Tính năng lọc (Advanced Filter)**:
  - **Client-side Filtering**: Sử dụng `React State` và `useMemo` để lọc dữ liệu tức thì không cần reload trang.
  - **Interactive Tags**: Thẻ metadata trên card có thể click được để kích hoạt bộ lọc tương ứng.
  - **UX**: Hỗ trợ nút "Áp dụng" để người dùng kiểm soát thời điểm lọc và nút "Đặt lại" để xóa bộ lọc nhanh.

### Trang Cài đặt (/settings)
- **Giao diện**: Layout 2 cột (Sidebar + Content) hiện đại, tự động chuyển đổi responsive giữa Mobile (Vertical Stack) và Desktop (Side-by-Side).
- **Tính năng**:
  - **Hồ sơ cá nhân**: 
    - Cập nhật Avatar với công cụ cắt ảnh (Image Cropper) tích hợp.
    - Thay đổi Bút danh (Nickname).
  - **Tài khoản & Bảo mật**: 
    - Gửi email đặt lại mật khẩu.
    - Khu vực nguy hiểm (Xóa tài khoản).
  - **Giao diện & Ngôn ngữ**: Tùy chỉnh Dark/Light mode và Ngôn ngữ hệ thống.
- **Kỹ thuật**:
  - **Supabase Integration**: Auth (User Session), Database (Profiles), Storage (Avatars).
  - **Server Components & Actions**: Tối ưu hóa hiệu năng và bảo mật khi xử lý dữ liệu người dùng.
  - **Robust Layout**: Sử dụng CSS Injection kết hợp Tailwind để đảm bảo layout sidebar hoạt động chính xác trên mọi kích thước màn hình.
