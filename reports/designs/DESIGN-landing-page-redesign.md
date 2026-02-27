## Design: Landing Page Redesign (Minimalist Literature)

### Overview
A comprehensive redesign of the Đồng Ngôn landing page to elevate its UX/UI from a wireframe state to a premium, minimalist literature platform. The design emphasizes high-contrast monochromatic themes, sophisticated typography, and elegant micro-animations.

### Visual Specifications

#### Component: Hero Section
- **Layout**: Full viewport height (`min-h-screen`), flex-col, centered content.
- **Colors**: `bg-white` (#F5F5F5) for the section background.
- **Typography**: 
  - Headline: `font-ganh`, `text-7xl` or `text-8xl`, tracking-tight.
  - Subtitle: `font-be-vietnam`, `text-lg`, `text-black/70`.
- **States**: N/A for content, but includes a fade-in on mount.

#### Component: Primary CTA Button ("Bắt Đầu Viết")
- **Layout**: `px-8 py-4`, `rounded-full` (pill shape).
- **Colors**: `bg-black` (#07000B), `text-white` (#F5F5F5).
- **Typography**: `font-be-vietnam`, `font-semibold`.
- **States**: 
  - default: `bg-black`
  - hover: `bg-black/80`, `shadow-lg`, subtle scale `scale-[1.02]`
  - disabled: `opacity-50`, `cursor-not-allowed`

#### Component: Search Bar (Integrated)
- **Layout**: Centered below or integrated into Hero, `w-full max-w-md`, `rounded-full`, `px-6 py-4`.
- **Colors**: `bg-white/80`, `backdrop-blur-md`, `border border-black/10`.
- **Typography**: `font-be-vietnam`, `text-black`.
- **States**:
  - default: `border-black/10`
  - focus: `border-black`, `ring-2 ring-black/5`

#### Component: Work Card (in Popular Works)
- **Layout**: `p-6`, `rounded-2xl`, flex-col.
- **Colors**: `bg-white` (#F5F5F5), `text-black`.
- **Typography**: 
  - Title: `font-ganh`, `text-2xl`.
  - Excerpt: `font-quicksand`, `text-sm`, `text-black/80`.
- **States**:
  - hover: `transform -translate-y-1`, `shadow-xl`, `transition-all duration-300`.

#### Transition: Light to Dark (Hero to Cumulative)
- **Layout**: A subtle gradient overlay (`bg-gradient-to-b from-white to-black h-32`) or a clean sharp cut with the Vietnamese pattern overlapping the boundary negatively (e.g., `-mt-16 relative z-10`).

### Responsive
| Breakpoint       | Behavior   |
| ---------------- | ---------- |
| Mobile (<640px)  | Hero headline scales down to `text-5xl`. Cards stack vertically. Pattern hides or becomes subtle background. |
| Desktop (>1024px)| Full horizontal spread for Popular Works (Grid or Carousel). Pattern anchors firmly to the left edge. |

### Accessibility
- Contrast: `#07000B` on `#F5F5F5` provides a 17.5:1 ratio (Passes AAA).
- Focus indicators: All interactive elements receive a `ring-2 ring-black/20 ring-offset-2` on `:focus-visible`.
- Touch Targets: Buttons and search inputs are minimum `48px` tall.
