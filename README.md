# Đồng ngôn (Website)

## Introduction / Giới thiệu
**Đồng ngôn** is a sanctuary for literature enthusiasts to store, share, and experience poetry and prose. It provides a quiet space for fleeting inspirations and collective creative works.

**Đồng ngôn** là không gian tĩnh lặng để lưu trữ, chia sẻ và cảm nhận những áng thơ văn, câu nói hay và cảm xúc đong đầy.

## Key Features / Tính năng chính
1. **Literature Repository**: A secure vault for poems, prose, and spontaneous inspirations.
2. **Collective Creation**: Support for various forms of literature including Poetry (Free verse, Luc Bat, etc.) and Prose (Essays, Short stories).
3. **Advanced Filtering**: Categorize and discover works by Genre (Poetry/Prose) and Era (Ancient, Medieval, Modern).
4. **User Profiles**: Personalized nicknames, avatar customization, and secure authentication.
5. **Interactive Experience**: Smooth navigation, voting systems, and real-time updates.

## Contributions / Đóng góp

### Purpose & Uniqueness / Mục đích & Sự khác biệt
**Đồng ngôn** isn't just another social platform—it's a deliberate step away from the noise of modern content feeds. Our purpose is to create a digital sanctuary dedicated exclusively to the preservation, creation, and appreciation of poetry and prose. 

What makes this project unique? 
- **Slow Consumption**: No infinite doom-scrolling. Our interface encourages you to pause, read deeply, and reflect.
- **Craft-focused Environment**: Features are tailored specifically for writers, avoiding algorithmic pressure for instant gratification.
- **Cultural Preservation**: Special emphasis on traditional Vietnamese forms (like Lục Bát) alongside modern free verse, preserving our linguistic heritage.

/ **Mục đích & Sự khác biệt**
**Đồng ngôn** không chỉ là một nền tảng xã hội bình thường—nó là một bước lùi có chủ ý khỏi sự xô bồ của các bảng tin nội dung hiện đại. Mục đích của chúng tôi là tạo ra một nơi tôn nghiêm kỹ thuật số dành riêng cho việc lưu giữ, sáng tác và trân trọng thơ văn.

Điều gì làm dự án này khác biệt?
- **Tiêu thụ chậm rãi**: Không có việc cuộn trang vô tận. Giao diện của chúng tôi khuyến khích bạn dừng lại, đọc thật sâu và suy ngẫm.
- **Tập trung vào chuyên môn**: Các tính năng được thiết kế dành riêng cho người viết, tránh áp lực thuật toán để tìm kiếm sự thỏa mãn tức thời.
- **Bảo tồn văn hóa**: Đặc biệt chú trọng vào các hình thức truyền thống của Việt Nam (như thơ Lục Bát) cùng với thơ tự do hiện đại, giữ gìn di sản ngôn ngữ của chúng ta.

---

We enthusiastically welcome literary contributions from our community. To maintain the tranquil and high-quality nature of **Đồng ngôn**, please adhere to the following guidelines: / Chúng tôi rất hoan nghênh những đóng góp văn học từ cộng đồng. Để duy trì chất lượng và không gian tĩnh lặng của **Đồng ngôn**, vui lòng tuân thủ các nguyên tắc sau:

### Rules for Submitting Works / Quy định khi gửi bài

1. **Originality / Tính nguyên bản**: Submissions should be your own original work. If quoting or sharing others' work, proper credit and authorization must be provided. / Tác phẩm gửi lên nên là sáng tác gốc của bạn. Nếu trích dẫn hoặc chia sẻ tác phẩm của người khác, phải ghi rõ nguồn và có sự cho phép.
2. **Appropriate Content / Nội dung phù hợp**: Content must not include hate speech, discrimination, harassment, explicit material, or violate any laws. / Nội dung không được chứa ngôn từ kích động thù địch, phân biệt đối xử, quấy rối, nội dung đồi trụy hoặc vi phạm bất kỳ pháp luật nào.
3. **Respectful Tone / Tôn trọng**: Maintain a respectful and constructive environment. / Duy trì một môi trường tôn trọng và mang tính xây dựng.
4. **No AI Images / Khước từ ảnh AI**: AI-generated images are strictly prohibited on the platform. / Tuyệt đối không sử dụng hình ảnh do AI tạo ra trên nền tảng.

### Unique Features for Writers / Các tính năng độc đáo dành cho người viết

- **Real-time Editor**: A distraction-free, dual-pane editor that lets you see your formatted poetry or prose instantly. / Trình soạn thảo hai ngăn, không gây xao nhãng, cho phép bạn xem ngay bài thơ hoặc văn xuôi đã được định dạng.
- **Metadata Tagging**: Easily categorize your work by Genre (e.g., Free verse, Luc bat, Essay) and Era (Ancient, Medieval, Modern) for better discoverability. / Dễ dàng phân loại tác phẩm của bạn theo Thể loại (ví dụ: Thơ tự do, Lục bát, Tản văn) và Thời đại (Cổ đại, Trung đại, Hiện đại) để dễ dàng khám phá hơn.
- **Secure Storage**: Your drafts and published works are securely stored and tied to your authenticated profile. / Các bản nháp và tác phẩm đã xuất bản của bạn được lưu trữ an toàn và gắn liền với hồ sơ đã được xác thực của bạn.

## Tech Stack / Công nghệ sử dụng
- **Core**: [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation & UX**:
  - [Framer Motion](https://www.framer.com/motion/) (Transitions and interactions)
  - [Lenis](https://lenis.darkroom.engineering/) (Smooth scrolling)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Real-time Auth, Storage)
- **Analytics**: [PostHog](https://posthog.com/)
- **Testing**: [Playwright](https://playwright.dev/)

## Getting Started / Hướng dẫn chạy thử

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 to view the project
```

## Project Structure / Cấu trúc dự án
- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components organized by feature (About, Contribution, Popular, Settings).
- `supabase/`: Database migrations and edge functions.
- `utils/`: Helper functions and Supabase client configuration.
- `public/`: Static assets including fonts and logos.

## Technical Highlights / Đặc điểm kỹ thuật
- **Hybrid Rendering**: Strategic use of Server and Client components for optimal performance and SEO.
- **Dynamic Content Flow**: Implemented via `CumulativeSection` and `HeroSection` for an engaging landing experience.
- **Secure Persistence**: User profiles and literature works are managed through Supabase with strict Row Level Security (RLS).
- **Responsive Design**: Mobile-first architecture ensured via Tailwind 4 and custom fluid layouts.
- **Modern Typography**: Integrated local fonts (Ganh Type) and Google Fonts (Quicksand, Be Vietnam Pro) via `next/font`.
