

# Fix Desktop Preview Frame + Phase 5: Production Hardening

## Part A: Desktop Preview Frame Fix

**Root cause**: The last edit (lines 220-235) conditionally stripped `border-2 border-border/50 shadow-2xl shadow-black/20 ring-1 ring-border/20` and `borderRadius: "0.75rem"` from desktop mode, turning it into a raw flat rectangle.

**Fix**: Keep the desktop preview filling the pane (`flex-1`) but restore the rounded frame with a small padding so the border/shadow/radius are visible. The outer container should use `flex flex-col p-2` for desktop instead of the current bare `flex flex-col`, and the motion.div should always get the border/shadow/ring classes plus the `0.75rem` radius for desktop.

### Changes in `src/components/playground/PreviewPanel.tsx`
- Line 220: Change desktop branch from `"flex flex-col"` to `"flex flex-col p-3"` so there is breathing room for the shadow/border
- Line 228: Always apply `border-2 border-border/50 shadow-2xl shadow-black/20 ring-1 ring-border/20` (remove the conditional that strips it for desktop)
- Line 229-233: For desktop, apply `borderRadius: "0.75rem"` via the style object instead of `{}`
- Desktop motion.div keeps `flex-1 min-h-0` so it stretches to fill, but now with the polished frame

---

## Part B: Phase 5 — Production Hardening

### 1. Route-level Code Splitting
**File: `src/App.tsx`**
- Replace direct imports of Dashboard, Playground, Settings, Admin, About with `React.lazy()` 
- Wrap each lazy route in `<Suspense>` with a loading fallback (spinner)
- Keep Index (landing) as a direct import since it is the entry point

### 2. Page Titles
**File: `src/hooks/usePageTitle.ts`** (NEW)
- Simple hook: `usePageTitle(title: string)` sets `document.title` to `${title} | AIKO`
- Apply in each page component (Dashboard, Playground, Settings, Auth, About, Index)

### 3. Privacy & Terms Pages
**Files: `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`** (NEW)
- Placeholder legal pages with professional layout matching the landing page style
- Add routes in `App.tsx`

### 4. Cookie Consent Banner
**File: `src/components/CookieConsent.tsx`** (NEW)
- Fixed bottom banner with Accept/Decline buttons
- Stores preference in `localStorage` under `aiko-cookie-consent`
- Only shows if no preference is saved
- Render in `App.tsx` inside BrowserRouter

### 5. SEO Meta Tags
**File: `index.html`**
- Already has good OG/Twitter meta tags
- Update the OG image URL to an AIKO-branded placeholder instead of the Lovable default
- Add JSON-LD structured data for the landing page (Organization schema)

### 6. Edge Function Rate Limiting
**File: `supabase/functions/aiko-chat/index.ts`**
- Add simple in-memory rate limiter: Map of user-id to request timestamps
- Reject with 429 if more than 30 requests in 60 seconds
- Clean up old entries on each request

### 7. ARIA Labels Audit
- No new files; targeted edits across existing components
- Add `aria-label` to: device switcher buttons in PreviewPanel, mode toggle in ChatPanel, file tree buttons, toolbar icons
- Ensure all interactive elements are keyboard-accessible

### File Tree

```text
src/
  App.tsx                              [MODIFIED] - Lazy loading, Suspense, CookieConsent, new routes
  hooks/
    usePageTitle.ts                    [NEW] - Set document.title per route
  pages/
    Privacy.tsx                        [NEW] - Privacy policy placeholder
    Terms.tsx                          [NEW] - Terms of service placeholder
    Dashboard.tsx                      [MODIFIED] - usePageTitle
    Settings.tsx                       [MODIFIED] - usePageTitle
    Auth.tsx                           [MODIFIED] - usePageTitle
    About.tsx                          [MODIFIED] - usePageTitle
    Index.tsx                          [MODIFIED] - usePageTitle
    Playground.tsx                     [MODIFIED] - usePageTitle
  components/
    CookieConsent.tsx                  [NEW] - Cookie consent banner
    playground/
      PreviewPanel.tsx                 [MODIFIED] - Restore desktop frame styling
      ChatPanel.tsx                    [MODIFIED] - ARIA labels
  index.html                           [MODIFIED] - JSON-LD, updated OG image
supabase/
  functions/
    aiko-chat/
      index.ts                         [MODIFIED] - Rate limiting
```

### Subtasks
1. Fix desktop preview: restore padding, border, shadow, and border-radius on the desktop motion.div
2. Add `React.lazy()` and `Suspense` for Dashboard, Playground, Settings, Admin, About
3. Create `usePageTitle.ts` hook and apply to all pages
4. Create `Privacy.tsx` and `Terms.tsx` placeholder pages with routes
5. Create `CookieConsent.tsx` banner, render in App.tsx
6. Update `index.html` with JSON-LD structured data
7. Add rate limiting logic to `aiko-chat/index.ts` (30 req/min per user)
8. Add ARIA labels to interactive elements in PreviewPanel and ChatPanel

