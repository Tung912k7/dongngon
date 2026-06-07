---
name: Đồng ngôn
description: A digital sanctuary for slow literary consumption and quiet reflection.
colors:
  primary: "#003633"
  primary-light: "#134e4a"
  accent: "#d4af37"
  neutral-bg: "#faf8f5"
  neutral-ink: "#1c1b1a"
  neutral-border: "#eae6e1"
  neutral-surface: "#fcfaf8"
typography:
  display:
    fontFamily: "Ganh, ui-serif, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Ganh, ui-serif, Georgia, serif"
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.025rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "16px"
  lg: "24px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "12px 28px"
  card-container:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Đồng ngôn

## 1. Overview

**Creative North Star: "The Digital Sanctuary"**

Đồng ngôn is designed as a quiet, physical-feeling reading room where literary works can breathe. The visual system represents a transition from bright, loud, neo-brutalist grids into a warm, organic, editorial-literary layout. It evokes the feeling of premium printed publications, old manuscripts, and contemporary zen poetry volumes.

The layout is characterized by asymmetric balance, deliberate negative space, and smooth, micro-animated transitions that feel responsive and alive, yet calming. It rejects high-contrast neo-brutalist shadows, thick black borders, neon accents, and generic boxy layouts.

**Key Characteristics:**

- **Warm Editorial:** Curated warm paper background paired with dark charcoal ink and deep forest teal accents.
- **Asymmetric Rhythm:** Fluid spacing and variable card dimensions that break rigid grid patterns.
- **Micro-interactions:** Calm, spring-curve transitions and ink-inspired details.

## 2. Colors

The color palette is built around warm paper tones and deep natural ink hues, maximizing reading comfort and text contrast.

### Primary

- **Deep Forest Teal** (#003633): The primary brand tone, representing deep quietness and nature. Used for key accents and focus elements.
- **Teal Container** (#134e4a): A slightly lighter, more ambient teal used for main active states, buttons, and badges.

### Accent

- **Literary Gold** (#d4af37): A warm metallic tone symbolizing craft, prestige, and highlight. Used sparingly (under 5% coverage) to direct user attention.

### Neutral

- **Warm Paper Cream** (#faf8f5): The universal background canvas, offering high readability with reduced glare.
- **Bright Paper Surface** (#fcfaf8): A slightly lighter tint for surface card backings and containers to establish depth.
- **Ink Charcoal** (#1c1b1a): The primary ink tone for reading copy, delivering a high contrast ratio (>= 4.5:1) while remaining softer than pure black.
- **Mist Grey** (#eae6e1): A soft, muted outline color used for subtle dividers and thin borders.

### Named Rules

**The Ochre Contrast Rule.** All reading copy must remain in Ink Charcoal (#1c1b1a) to guarantee WCAG AA level accessibility. Muted text must never fall below #5a5a5a on the warm cream background.
**The Sparsity Rule.** Literary Gold (#d4af37) must occupy no more than 5% of any given screen, reserving its appearance for intentional highlights.

## 3. Typography

The typeface pairing blends traditional Vietnamese serif forms with highly readable modern sans-serifs, optimized for digital typesetting.

**Display Font:** `Ganh` (serif-like with traditional block-printed qualities)
**Body Font:** `Be Vietnam Pro` (clean, highly-legible geometric sans-serif)

**Character:** The display serif `Ganh` provides strong character, history, and voice, while the sans-serif `Be Vietnam Pro` ensures frictionless reading at small and medium sizes.

### Hierarchy

- **Display** (Regular 400, clamp(2rem, 5vw, 3.5rem), 1.1, -0.02em): Used for hero title and display headings.
- **Headline** (Regular 400, clamp(1.5rem, 3.5vw, 2.25rem), 1.2): Used for section titles.
- **Title** (Medium 500, 1.25rem, 1.3): Used for cards and secondary headers.
- **Body** (Regular 400, 1.025rem, 1.65): Used for all literature prose, essays, and reading elements. Limited to a comfortable 65–75ch reading line length.
- **Label** (Medium 500, 0.875rem, letter-spacing: 0.05em, uppercase): Used for navigation links, eyebrows, and active actions.

### Named Rules

**The Balanced Headline Rule.** Display and Headline typography must always use `text-wrap: balance` (or `text-wrap: pretty` for long prose) to eliminate ugly word wrapping and orphaned text on narrow screens.

## 4. Elevation

The system is primarily flat and layered. Visual depth is established through tint changes (tonal layering) and double-bezel borders rather than heavy, artificial drop shadows.

### Shadow Vocabulary

- **Ambient Hover Glow** (`box-shadow: 0 4px 20px rgba(19, 78, 74, 0.04)`): A soft, wide teal-tinted shadow that appears exclusively during element hover states.
- **Overlay Elevation** (`box-shadow: 0 12px 32px rgba(28, 27, 26, 0.03)`): Used on modals and dropdowns to separate them from the reading layer.

### Named Rules

**The Border-First Rule.** Depth is created through thin 1px border lines in Mist Grey (#eae6e1) and surface-tint overlays. Shadows must never be solid black or have a blur radius smaller than 12px.

## 5. Components

### Buttons

- **Shape:** Rounded full pill (rounded-full).
- **Primary:** Warm Teal background (#134e4a) with Warm Paper Cream text (#faf8f5) and thin 1px borders.
- **Hover / Focus:** Scale slightly on hover (scale-[1.02] with spring transition) and shift to deep teal (#003633). Focus ring is Literary Gold (#d4af37).

### Cards / Containers

- **Corner Style:** Medium rounded corners (16px / rounded-2xl) or large rounded corners (24px / rounded-3xl).
- **Background:** Bright Paper Surface (#fcfaf8) or warm cream tints.
- **Border:** 1px solid Mist Grey (#eae6e1).
- **Double Bezel Pattern:** Features an outer thin border with generous spacing, wrapping an inner content card to evoke a framed portrait/manuscript container.

### Inputs / Fields

- **Style:** Light background, 1px solid border in Mist Grey (#eae6e1), rounded-xl.
- **Focus:** Warm Teal border glow with active outline-offset.

### Navigation

- **Style:** Top-aligned clean bar. Active navigation link is surrounded by a translucent pill background (`bg-deep-teal/[0.06] rounded-full`) with wide letter-spacing.

## 6. Do's and Don'ts

### Do:

- **Do** respect the 65-75ch line length limit for poems and essays to keep reading effortless.
- **Do** pair thin 1px borders with tint-based surfaces to differentiate sections.
- **Do** use fluid `clamp()` margins to give headers and hero content breathing room.
- **Do** align headers and parallel card blocks to maintain asymmetric structural integrity.

### Don't:

- **Don't** use gradient text or colored text highlights on titles; use weight, size, and single colors.
- **Don't** use heavy, harsh black drop shadows (anti-neo-brutalist).
- **Don't** use all-caps on body text or any heading block exceeding 4 words.
- **Don't** use side-stripe colored borders on cards or alerts to highlight active elements.
- **Don't** use card corner-radii exceeding 24px (rounded-3xl) for container boxes.
