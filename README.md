# Project Title: Website [Đồng ngôn]

## Description:
    Tính năng:
        1. Lữu trữ những thứ đoạn thơ/văn ngẫu hứng của tôi và ny.
        2. Thơ/Văn xuôi tập thể.
            a. Thơ:
                - Thể thơ: Tự do, lục bát, song thất lục bát, thất ngôn tứ tuyệt, thất ngôn bát cú.
            b. Văn xuôi:
                - Thể loại văn: Tản văn, truyện ngắn.
            c. Tiểu thuyết (Coming soon)
        3. Quy luật:
                - 2 chế độ: 1 kí tự/ 1 bài/ 1 ngày hoặc 1 câu/ 1 bài/ 1 ngày.
                - Không có chủ đề cố định, mọi thứ đều là cảm hứng.
                - Mỗi người sẽ có 1 bút danh (nickname).
                - Là tài sản của cộng đồng, không ai được phép đánh bản quyền hoặc lấy làm của riêng, kể cả chủ trang web.
                - Cấm những hành động, câu viết có nội dung xuyên tạc, bịa đặt, chống phá, không phù hợp với thuần phong mỹ tục và trái với luật hiện hành của Việt Nam.
        4. Bộ lọc: 
            Lọc theo thể loại -> Thể loại thơ (văn)/Thời kì (Cổ đại, trung đại, cận đại, hiện đại).

## Tech Stack (Công nghệ sử dụng)

- **Core**: [Next.js 14+](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: 
  - [Framer Motion](https://www.framer.com/motion/) (Hiệu ứng chuyển cảnh, tương tác)
  - [react-pageflip](https://github.com/Nodlik/react-pageflip) (Hiệu ứng lật trang sách 3D)
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
