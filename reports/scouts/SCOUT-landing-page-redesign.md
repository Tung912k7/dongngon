# Scout Report: Landing Page Redesign

## Exploration Scope
- Target: Landing page structure, existing design tokens, and components.
- Boundaries: `tailwind.config.ts`, `app/globals.css`, `app/page.tsx`, `components/`

## Patterns Discovered
### Pattern: Monochromatic Theme Tokens
- **Location**: `tailwind.config.ts`, `app/globals.css`
- **Usage**: The project overrides default black and white to `black: "#07000B"` (Natural Black) and `white: "#F5F5F5"` (White Smoke). These are mapped to `--foreground` and `--background`.
- **Must Follow**: Yes. The minimalist literature aesthetic depends on these exact hex codes.

### Pattern: Typography System
- **Location**: `app/globals.css`
- **Usage**: The system uses three primary font families:
  - `font-ganh` (var(--font-ganh-next)): Used for headers (H1-H6) and tags/serif styling.
  - `font-be-vietnam` (var(--font-be-vietnam-next)): Used for body text, inputs, buttons.
  - `font-quicksand` (var(--font-quicksand)): Available as a utility font.
- **Must Follow**: Yes. Headings MUST use `font-ganh`. Body text MUST use `font-be-vietnam`.

### Pattern: Landing Page Composition
- **Location**: `app/page.tsx`
- **Usage**: The page is structured sequentially into:
  1. `<HeroSection />` (Wrapped in a custom `<SectionFade>` component)
  2. `<CumulativeSection />` (Provides the main content flow, featuring a black background and "Popular Works")
  3. `<Footer />`
- **Must Follow**: Yes, modifications to the landing page flow should happen within or between these components.

## Integration Points
| Point | File | Function | New Code Location |
| ------ | ------ | -------- | ----------------- |
| Hero | `components/HeroSection.tsx` | Top section of the landing page, currently containing the search bar and placeholder text. | Redesign the hero content, CTA, and search bar integration here. |
| Main Content | `components/CumulativeSection.tsx` | The large black block with traditional patterns and popular works. | Adjust typography scale, border-radius of cards, and introductory text here. |
| Configuration | `tailwind.config.ts` | Theme definitions | New border-radius tokens, micro-animations, or transition utilities should be added here. |

## Conventions
- Naming: React components use PascalCase (e.g., `HeroSection.tsx`).
- File organization: All reusable UI parts are in the `components/` directory. Next.js App Router conventions are used for pages.

## Warnings
- ⚠️ Ensure that extreme contrast changes (e.g., `#F5F5F5` to `#07000B`) are smoothed out or handled carefully in CSS to avoid jarring visual jumps.
- ⚠️ Any new animations should respect the elegant, slow-paced aesthetic (e.g., the existing `subtle-zoom` is 20s). Do not introduce fast or bouncy animations.
