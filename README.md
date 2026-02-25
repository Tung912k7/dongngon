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
