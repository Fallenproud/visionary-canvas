

# Visual Polish & Brand Elevation Sprint

## Goal
Elevate the entire platform's visual fidelity to a top-tier, futuristic SaaS aesthetic — without changing any structure, layout, routing, or functionality. Pure GFX/UX refinement.

## Scope (visual only — zero structural changes)

### 1. Brand System
- **New SVG Logo**: Custom animated AIKO mark — geometric "A" formed by intersecting gradient strokes with subtle aurora shimmer. Replaces the current text-only "AIKO" wordmark across Navigation, Footer, Auth, Dashboard, Admin.
- **Refined Color Tokens** (`src/index.css`): Introduce a richer accent system — primary indigo→violet→cyan tri-stop gradient, deeper surface blacks, refined border luminance. All HSL, all token-based.
- **Favicon refresh**: Matching SVG favicon in `index.html`.

### 2. Futuristic Atmospheric Effects (`src/index.css` utilities)
- **Aurora gradient blobs**: Slow-drifting animated radial gradients for hero/page backgrounds
- **Noise grain overlay**: Subtle film-grain SVG texture utility for depth
- **Conic shimmer**: Rotating conic-gradient utility for premium card borders
- **Animated mesh enhancement**: Upgrade existing `.bg-mesh` with breathing animation
- **Glow-on-hover**: Refined `.glow-accent` with multi-layer shadows
- **Gradient text upgrade**: Tri-stop animated gradient for headlines
- New keyframes: `aurora-drift`, `gradient-shift`, `border-shimmer`, `breathe`

### 3. Micro-interaction Polish (Framer Motion — already installed)
- **Navigation**: Logo entrance animation, smoother dropdown spring physics, magnetic hover on CTA
- **Hero**: Refined stagger, parallax on phone mockup, animated gradient orb behind headline
- **Features cards**: Upgraded tilt with glow trail on hover, icon micro-bounce
- **Pricing cards**: Border shimmer on featured plan, scale-spring on hover
- **Stats**: Smoother count-up easing, subtle glow on numbers
- **Buttons**: Add ripple/shine sweep on primary buttons (CSS only, via button variant)

### 4. Page-Level Refinements (visual only, no layout shifts)
- **Auth page**: Aurora background, glass card upgrade, animated logo
- **Dashboard**: Subtle gradient mesh background, refined project card hover state with conic border
- **Admin panel**: Tab indicator glow, KPI cards with gradient accent borders, status dot pulse
- **Settings**: Section dividers with gradient hairlines
- **Footer**: Gradient top-border, animated social icons
- **NotFound/Privacy/Terms**: Matching atmospheric background

### 5. Performance & Motion Hygiene
- All animations respect `prefers-reduced-motion`
- GPU-accelerated transforms only (no layout-triggering props)
- Lazy-paint heavy effects (aurora blobs use `will-change` sparingly)
- Zero new packages — all effects via CSS + existing Framer Motion

## Files Touched (visual-only edits)

| File | Change |
|------|--------|
| `src/index.css` | New tokens, aurora/grain/shimmer utilities, keyframes |
| `index.html` | New SVG favicon |
| `src/components/Logo.tsx` | **NEW** — animated SVG brand mark |
| `src/components/Navigation.tsx` | Swap wordmark → `<Logo/>`, polish dropdown motion |
| `src/components/Hero.tsx` | Aurora orb, refined gradient headline |
| `src/components/Features.tsx` | Upgraded card hover (glow trail) |
| `src/components/Pricing.tsx` | Featured-plan shimmer border |
| `src/components/Stats.tsx` | Number glow accent |
| `src/components/Footer.tsx` | Gradient hairline + Logo |
| `src/components/ui/button.tsx` | Add subtle shine on `default` variant |
| `src/pages/Auth.tsx` | Aurora bg + Logo |
| `src/pages/Dashboard.tsx` | Mesh bg, refined card hover |
| `src/pages/Admin.tsx` | Tab indicator glow |
| `src/components/admin/AdminOverview.tsx` | Gradient KPI accents |
| `src/pages/Settings.tsx` | Gradient section dividers |
| `src/pages/NotFound.tsx` | Atmospheric bg |
| `src/pages/Privacy.tsx` / `src/pages/Terms.tsx` | Matching bg |

## What this does NOT touch
- ❌ No routing changes
- ❌ No component prop/API changes
- ❌ No layout/structure rewrites
- ❌ No backend / edge function / DB changes
- ❌ No new packages
- ❌ No removed features — every existing button, link, flow stays identical

## Outcome
A cohesive, futuristic, "wow"-tier visual identity — aurora atmospherics, animated brand mark, premium micro-interactions, gradient-rich surfaces — while preserving the exact current architecture and user flows.

