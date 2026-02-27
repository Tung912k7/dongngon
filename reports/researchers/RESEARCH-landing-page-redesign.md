## Research Report: Landing Page Redesign (Minimalist Literature/Collaborative Writing)

### Executive Summary
The proposed redesign targets a "Minimalist Literature" aesthetic. Best practices for this domain heavily rely on typography as the primary visual element, high-contrast monochromatic palettes with subtle interactive accents, and abundant negative space to simulate the reading experience of a physical book or high-end editorial magazine. 

### Findings

#### Finding 1: Typographic Hierarchy in Minimalist UI
Effective minimalist web design uses extreme contrast in font sizes and weights to establish hierarchy without relying on color. 
- Source: [Nielsen Norman Group: Minimalist Web Design](https://www.nngroup.com/articles/minimalist-design/)
- Confidence: High

#### Finding 2: The "Hero-Centric" Landing Page Structure
For collaborative platforms, the hero section must clearly state the value proposition ("Dệt Nên Câu Chuyện") and provide a frictionless entry point (Primary CTA: "Bắt Đầu Viết", Secondary: Search/Explore). Deep black backgrounds for secondary sections help reduce eye strain for reading while maintaining visual striking contrast.
- Source: [Awwwards: Editorial Web Design Trends](https://www.awwwards.com/editorial-web-design-trends.html)
- Confidence: High 

#### Finding 3: Micro-Interactions in Monochromatic Design
When color is restricted to black and white, interactivity must be communicated through motion (e.g., subtle scale transforms, underline animations on hover, or cursor changes). Floating elements (like pill-shaped navs) require soft drop shadows or backdrop-blur (glassmorphism) to ensure proper z-index layering against scrolling content.
- Source: [UX Collective: Designing without Color](https://uxdesign.cc/)
- Confidence: High

### Recommendations
1. **Recommended**: Standardize border-radius to a softer `rounded-2xl` or `rounded-full` (pill shape) for all interactive containers (buttons, search, cards) to create a cohesive geometry against the strict vertical/horizontal grid of text.
2. **Recommended**: Implement Framer Motion (or CSS transitions) for smooth section reveal animations (e.g., fading in the dark section pattern).
3. **Recommended**: Use `bg-white/80` with `backdrop-blur-md` for floating elements to ensure they remain legible as users scroll across the transition from white to black background.

### Sources
1. [Nielsen Norman Group] - accessed 2026-02-27
2. [Awwwards] - accessed 2026-02-27
3. [UX Collective] - accessed 2026-02-27
