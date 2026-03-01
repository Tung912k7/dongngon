# 🎨 Visual Design System: "Đồng ngôn - Modern Library"

Based on the [ui-ux-pro-max](file:///c:/Users/LAPTOP/Desktop/Projects/Website/dongngon/.agent/skills/ui-ux-pro-max/SKILL.md) design intelligence, this report outlines the transition from a "Functional Grid" to a "Premium Literary Gallery".

## 👁️ Visual Philosophy
> "Design that doesn't compete with the word, but cradles it."
- **Focus**: Typography over UI chrome.
- **Space**: Generous margins and breathing room (leading).
- **Material**: Surface-driven UI (Paper, Glass, Parchment).

## 🎨 Color Palette (Premium Minimalist)
| Role | Hex | Tailwind Utility |
|------|-----|------------------|
| **Background** | `#FAFAFA` | `bg-[#FAFAFA]` |
| **Primary Text**| `#171717` | `text-[#171717]` |
| **Muted Text**  | `#525252` | `text-[#525252]` |
| **Border/Rule** | `#E5E5E5` | `border-[#E5E5E5]` |
| **Accent Action**| `#D4AF37` | `text-[#D4AF37]` (Gold) |

## 🖋️ Typography System
1. **Headings (Titles)**: `font-serif` (Playfair Display / Lora)
   - *Feel*: Authoritative, classic, premium.
2. **Body (Metadata)**: `font-sans` (Inter / Quicksand)
   - *Feel*: Modern, readable, neutral.

## ✨ Component Refinements

### 1. The "Work Card" (The Literary Unit)
- **Current**: Standard rounded border.
- **Goal**: "Manuscript Preview" style.
- **Design Tokens**:
  - `shadow-sm` on rest, `shadow-xl` on hover.
  - Subtle `border-l-2 border-transparent` transitioning to `border-black` on hover.
  - Hover lift: `-translate-y-2`.

### 2. The Floating Navigation (The Minimalist Compass)
- **Current**: Fixed at top.
- **Goal**: Floating Glassmorphism.
- **Design Tokens**:
  - `bg-white/80 backdrop-blur-md`.
  - Floating 16px from edges.
  - `rounded-full` for pill-shaped interaction.

### 3. Transitions (Framer Motion)
- **Staggered Entry**: Cards should "float" in one by one.
- **Spring Physics**: `type: "spring", stiffness: 300, damping: 30`.

## 🚀 Implementation Priority
1. Update `tailwind.config.ts` with brand colors.
2. Refactor `WorkCard.tsx` with premium hover states.
3. Update `DongNgonClient.tsx` background and spacing.
