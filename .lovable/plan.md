

# AIKO Platform: Comprehensive Audit, Production Readiness Assessment, and Beta Launch Plan

---

## Current State Assessment

### Production Readiness by Area (% complete)

| Area | Score | Status |
|------|-------|--------|
| **Authentication & Security** | 75% | Functional but missing critical hardening |
| **Database & RLS** | 85% | Solid RLS policies, minor gaps |
| **Playground Core (Chat + AI)** | 70% | Working but fragile error handling, edge cases |
| **Playground UI (Explorer/Preview)** | 60% | Explorer doesn't fill pane, no scaffold files |
| **Landing Page (/)** | 55% | Functional but generic visuals, placeholder content |
| **Dashboard** | 65% | Works but lacks polish and feedback |
| **Settings** | 40% | Bare minimum, no plan management or preferences |
| **Edge Function (aiko-chat)** | 65% | Works but no rate limiting, input validation thin |
| **Error Handling & Resilience** | 40% | Many silent catches, no global error boundary |
| **Mobile Responsiveness** | 35% | Landing page partially responsive, playground desktop-only |
| **Performance & Loading States** | 50% | Some loading states, no skeleton screens, no lazy loading |
| **Overall Production Readiness** | **~58%** | Viable for closed beta, needs work for public launch |

---

## Critical Issues (Must Fix Before Public Beta)

### 1. Explorer Does Not Fill the Pane
The explorer view (`rightPane === "explorer"`) uses `pt-4` at the top, and the FileTree + CodeViewer sit in a flex container that does fill the space. However, the `RightPaneToggle` is absolutely positioned at `top-3`, overlapping the content. The `pt-4` offset is too small -- the toggle itself is about 40px tall. The actual issue is that the explorer panel uses `pt-4` (16px) while the toggle button sits at `top-3` (12px) and is ~32px tall. The content starts behind the toggle. This should be `pt-12` like the workflows pane to clear the toggle properly.

**This is NOT placeholder for terminal** -- it is a layout bug. The explorer should stretch fully like the preview pane does.

### 2. No Global Error Boundary
If any component crashes, the entire app white-screens. React error boundaries are essential for production.

### 3. No Input Sanitization on Edge Function
The `aiko-chat` function accepts raw user input without length limits or content validation. A user could send megabytes of text.

### 4. Auth Token Not Passed to Edge Function
The chat function uses `VITE_SUPABASE_PUBLISHABLE_KEY` for auth instead of the user's session token. This means any unauthenticated user could call the edge function directly.

### 5. No Loading/Empty States for Many Flows
The playground has no skeleton loading state, the dashboard project cards don't have hover previews, and there are no empty states for workflows.

### 6. Footer Shows "2024" -- Should Be Dynamic
The footer hardcodes `(C) 2024 AIKO` instead of using the current year.

---

## The Plan: 5 Phases to Production Beta

---

## Phase 1: Explorer Fix, Scaffold Files, and Critical Bug Fixes

### What Changes

**Explorer layout fix:**
- Change the explorer container from `pt-4` to `pt-12` so content clears the RightPaneToggle
- This matches how the workflows pane already handles it

**Scaffold files for new projects:**
- When a new project is created, include a set of pre-built, professional boilerplate files that demonstrate best practices
- These files provide: a CSS reset with design tokens, a reusable Button component, a reusable Card component, utility helpers, and a proper App.tsx that imports and uses them
- These files are editable by the user but provide a strong starting point with top-tier aesthetics out of the box

**Global Error Boundary:**
- Add a React error boundary component that catches render crashes
- Shows a friendly "Something went wrong" UI with a retry button instead of a white screen

**Edge function auth hardening:**
- Pass the user's actual session bearer token instead of the anon key
- Add input length validation (max 10,000 chars per message)
- Add basic rate-limit headers check

### File Tree

```text
src/
  components/
    ErrorBoundary.tsx               [NEW] - Global React error boundary
  lib/
    templates.ts                    [MODIFIED] - Add professional scaffold files with reusable components
  pages/
    Playground.tsx                  [MODIFIED] - Fix explorer pt-4 to pt-12
  hooks/
    useChat.ts                      [MODIFIED] - Pass session token, add input validation
  App.tsx                           [MODIFIED] - Wrap in ErrorBoundary
supabase/
  functions/
    aiko-chat/
      index.ts                      [MODIFIED] - Validate auth token, input length limit
```

### Subtasks
1. Fix explorer padding: change `pt-4` to `pt-12` in the explorer branch of Playground.tsx (1 line change)
2. Create `ErrorBoundary.tsx` with try/catch render, friendly fallback UI, and "Reload" button
3. Wrap `<App />` routes inside `<ErrorBoundary>` in App.tsx
4. Update `templates.ts` to include professional scaffold files: `/styles.css` (design tokens, utilities), `/components/Button.tsx`, `/components/Card.tsx`, `/utils/helpers.ts`, and a richer `/App.tsx` that uses them
5. Update `useChat.ts` to use `session.access_token` in the Authorization header instead of the anon key
6. Add input length check in `useChat.ts` before sending (max 10,000 chars, show toast if exceeded)
7. Update edge function to validate the Authorization bearer token and reject requests over 15,000 chars total

---

## Phase 2: Landing Page Visual Overhaul

### What Changes

The landing page currently has functional components but they look generic for a commercial SaaS product. This phase elevates everything to production-grade visual quality inspired by Linear/Vercel/Stripe aesthetics.

**Navigation:**
- Add subtle gradient border-bottom instead of flat border
- Add a mobile hamburger menu (currently hidden on mobile entirely)
- Logo should use the accent color glow on hover

**Hero:**
- Add a radial gradient "spotlight" effect behind the hero content
- Replace the placeholder avatar circles with actual gradient avatars
- Add a subtle particle/grid background pattern
- Improve the phone mockup glow to be more dramatic with layered shadows
- Update the "Now in Beta" badge to use a shimmer animation

**Stats:**
- Add counter animation on scroll (numbers count up from 0)
- Add subtle dividers between stat items
- Use gradient text for the numbers

**Features:**
- Add staggered scroll-in animations (currently static)
- Make feature cards have a subtle 3D tilt on hover using CSS perspective
- Add more features relevant to AIKO (currently only 4, should have 6-8 for a richer grid)

**Demo:**
- Replace the simple icon animation with a more engaging interactive preview
- Add a subtle background mesh gradient

**Pricing:**
- Add annual/monthly toggle
- Add a "Most Popular" ribbon animation
- Improve card depth with layered shadows

**Contact:**
- Add a success animation after form submission (checkmark)
- Connect the form to actually store submissions in the database

**Footer:**
- Dynamic year
- Add social media icon components instead of plain text links
- Add a newsletter email signup input

### File Tree

```text
src/
  components/
    Navigation.tsx                  [MODIFIED] - Mobile menu, gradient border, logo glow
    Hero.tsx                        [MODIFIED] - Spotlight gradient, shimmer badge, better mockup glow
    Stats.tsx                       [MODIFIED] - Count-up animation, gradient text, dividers
    Features.tsx                    [MODIFIED] - More features, scroll animations, 3D tilt hover
    Demo.tsx                        [MODIFIED] - Better interactive preview, mesh background
    Pricing.tsx                     [MODIFIED] - Annual/monthly toggle, better card depth
    Contact.tsx                     [MODIFIED] - Success animation, store to DB
    Footer.tsx                      [MODIFIED] - Dynamic year, social icons, newsletter input
  index.css                         [MODIFIED] - New utility classes for gradients, mesh, shimmer
```

### Subtasks
1. Update `index.css` with new utility classes: `.bg-mesh-gradient`, `.shimmer-badge`, `.spotlight-radial`, `.gradient-text-hero`
2. Navigation: add mobile Sheet/drawer menu, gradient bottom-border, hover glow on logo
3. Hero: add radial spotlight div, shimmer animation on beta badge, gradient avatar placeholders, enhanced phone glow with multiple shadow layers
4. Stats: add `useInView` + counter animation using `useState`/`useEffect`, gradient text, vertical dividers
5. Features: expand to 6-8 features (add "Real-time Preview", "Version Control", "Multi-Agent AI", "Template Library"), add `whileInView` stagger animations, CSS perspective tilt on hover
6. Demo: add mesh gradient background, more interactive transitions
7. Pricing: add monthly/annual toggle state with discounted annual prices, improve card shadows
8. Contact: add success checkmark animation after submit, create a `contact_submissions` table and insert on submit
9. Footer: use `new Date().getFullYear()`, add SVG social icons (Twitter/X, GitHub, LinkedIn), add email newsletter input field

---

## Phase 3: Dashboard, Settings, and Auth Polish

### What Changes

**Dashboard:**
- Add project search/filter
- Add project card preview thumbnails (show last screenshot or placeholder gradient)
- Add sorting options (name, date, status)
- Add confirmation dialog before project deletion
- Add "Duplicate Project" action
- Empty state should be more engaging with illustration

**Settings:**
- Add avatar upload section
- Add "Danger Zone" section with account deletion
- Add notification preferences (sound toggle for completion chime)
- Add API key management section (for future integrations)
- Add theme/appearance section (placeholder for future dark/light toggle)

**Auth:**
- Add social login buttons (Google, GitHub) as "Coming Soon" placeholders
- Add password strength indicator
- Add "Remember me" checkbox
- Improve the form with better spacing and visual hierarchy

### File Tree

```text
src/
  pages/
    Dashboard.tsx                   [MODIFIED] - Search, sort, duplicate, delete confirmation, thumbnails
    Settings.tsx                    [MODIFIED] - Avatar, danger zone, preferences, API keys
    Auth.tsx                        [MODIFIED] - Social login placeholders, password strength, remember me
  components/
    ConfirmDialog.tsx               [NEW] - Reusable confirmation dialog
```

### Subtasks
1. Create `ConfirmDialog.tsx` -- reusable AlertDialog wrapper for destructive actions
2. Dashboard: add search input and sort dropdown, project card thumbnails (gradient placeholder based on project name hash), duplicate project mutation, delete confirmation dialog
3. Settings: add avatar upload to storage bucket, add danger zone with "Delete Account" behind confirmation, add sound preference toggle (persisted to profile), add placeholder sections for API keys and appearance
4. Auth: add disabled Google/GitHub buttons with "Coming Soon" badges, add password strength meter using regex scoring, add "Remember me" checkbox

---

## Phase 4: Playground Robustness and Polish

### What Changes

**Error resilience:**
- Add retry logic for failed edge function calls (exponential backoff, max 2 retries)
- Add network disconnection detection with reconnect banner
- Add message delivery confirmation (visual checkmark after DB save)
- Handle conversation load failures gracefully

**Loading states:**
- Add skeleton loading for project files in the explorer
- Add skeleton for chat messages while loading conversation history
- Add a proper loading splash for the playground while project data loads

**Chat improvements:**
- Add message timestamps (hover to see exact time)
- Add "Copy" button on code blocks in assistant messages
- Add "Regenerate" button on the last assistant message
- Add typing indicator while streaming
- Keyboard shortcuts: Cmd+Enter to send, Cmd+K to clear chat

**Preview improvements:**
- Add console output panel below the preview (collapsible) to show Sandpack console errors
- Add a "Loading failed" state if Sandpack crashes

**Explorer improvements:**
- Add file search (Cmd+P to search by filename)
- Add "New File" and "Delete File" actions
- Show file size indicators

### File Tree

```text
src/
  hooks/
    useChat.ts                      [MODIFIED] - Retry logic, network detection, delivery confirmation
  components/
    playground/
      ChatPanel.tsx                 [MODIFIED] - Timestamps, copy, regenerate, keyboard shortcuts
      ChatMessage.tsx               [MODIFIED] - Code block copy button, timestamp tooltip
      PreviewPanel.tsx              [MODIFIED] - Console panel, error state
      FileTree.tsx                  [MODIFIED] - Search, new/delete file actions, file size
      CodeViewer.tsx                [MODIFIED] - Skeleton loading state
      PlaygroundSkeleton.tsx        [NEW] - Full-page skeleton loading for playground
  pages/
    Playground.tsx                  [MODIFIED] - Loading splash, keyboard shortcut registration
```

### Subtasks
1. Add retry logic in `useChat.ts`: wrap the fetch in a loop with max 2 retries and 1s/2s backoff, only retry on 5xx or network errors
2. Add network status detection: `navigator.onLine` listener, show a yellow "Reconnecting..." banner at top of chat panel
3. Add `PlaygroundSkeleton.tsx` -- shown while project/files are loading (pulsing layout matching the real UI)
4. ChatMessage: add hover tooltip showing `format(msg.created_at, "MMM d, h:mm a")`, add copy-to-clipboard button on code blocks
5. ChatPanel: add "Regenerate" button (resends the last user message), add Cmd+Enter shortcut, add Cmd+K clear chat shortcut
6. PreviewPanel: add collapsible console error panel using Sandpack's error hooks
7. FileTree: add search input at top (Cmd+P focus), add context menu or buttons for "New File" / "Delete File"
8. CodeViewer: add skeleton shimmer while file content loads

---

## Phase 5: Final Production Hardening

### What Changes

**Performance:**
- Add React.lazy() for route-level code splitting (Playground, Dashboard, Admin, Settings)
- Add Suspense boundaries with loading fallbacks
- Memoize expensive computations (sandpack file conversion, tree building)

**SEO and Meta:**
- Add proper meta tags to index.html (title, description, og:image, twitter:card)
- Add structured data (JSON-LD) for the landing page
- Add proper page titles per route using useEffect or a layout component

**Accessibility:**
- Add proper ARIA labels to all interactive elements
- Add keyboard navigation for the file tree (arrow keys)
- Add focus management for modal dialogs
- Ensure color contrast meets WCAG AA

**Security final pass:**
- Enable leaked password protection (currently warned by linter)
- Add CSRF token validation for state-changing operations
- Add Content-Security-Policy headers
- Rate limit the edge function at the function level (track IP/user in a simple counter)
- Sanitize all user-displayed content to prevent XSS

**Analytics and Monitoring:**
- Add basic usage tracking (page views, project creates, messages sent) using a simple analytics table
- Add error logging to a dedicated table for post-launch debugging

**Legal/Compliance:**
- Add Privacy Policy page (even if placeholder)
- Add Terms of Service page (even if placeholder)
- Add cookie consent banner
- Add GDPR data export functionality in Settings

### File Tree

```text
src/
  App.tsx                           [MODIFIED] - Lazy loading, Suspense, page titles
  pages/
    Privacy.tsx                     [NEW] - Privacy policy page
    Terms.tsx                       [NEW] - Terms of service page
  components/
    SEOHead.tsx                     [NEW] - Per-page meta tag management
    CookieConsent.tsx               [NEW] - Cookie consent banner
  hooks/
    usePageTitle.ts                 [NEW] - Set document.title per route
  index.html                        [MODIFIED] - Meta tags, OG image, structured data
supabase/
  functions/
    aiko-chat/
      index.ts                      [MODIFIED] - Rate limiting, input sanitization
```

### Subtasks
1. Add React.lazy() imports for Dashboard, Playground, Settings, Admin, About pages with Suspense fallbacks
2. Create `usePageTitle.ts` hook and apply to all pages
3. Create `SEOHead.tsx` or update `index.html` with proper meta tags
4. Create placeholder `Privacy.tsx` and `Terms.tsx` pages, add routes
5. Create `CookieConsent.tsx` -- a bottom banner with Accept/Decline stored in localStorage
6. Add ARIA labels audit: file tree buttons, toolbar icons, chat input, mode toggle
7. Enable leaked password protection via auth configuration
8. Add rate limiting in edge function: simple in-memory counter per request (log and reject after 30 req/min)
9. Create `analytics_events` table and a simple `trackEvent(name, metadata)` utility
10. Add error logging: create `error_logs` table, add global window.onerror handler that inserts errors

---

## Database Changes Required

| Table | Operation | Purpose |
|-------|-----------|---------|
| `contact_submissions` | CREATE | Store contact form submissions |
| `analytics_events` | CREATE | Track usage events |
| `error_logs` | CREATE | Log frontend errors |

No changes to existing tables. All new tables will have proper RLS policies scoped to user ownership.

---

## What This Plan Does NOT Change
- Existing database schema for projects, files, conversations, messages, snapshots
- The Sandpack preview engine and its configuration
- The SSE streaming protocol
- The multi-agent routing architecture
- The existing RLS policies (already solid)
- The workflow canvas SVG renderer

---

## Recommended Launch Order

1. **Phase 1** (Critical fixes) -- Do this FIRST, everything else depends on stability
2. **Phase 2** (Landing page) -- This is what new visitors see first
3. **Phase 4** (Playground polish) -- This is what paying users interact with daily
4. **Phase 3** (Dashboard/Settings/Auth) -- Important but less urgent than the core product
5. **Phase 5** (Hardening) -- Final pass before opening the gates

Each phase is independently deployable and testable. No phase depends on a later phase.

