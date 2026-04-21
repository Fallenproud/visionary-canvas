# AIKO — Roadmap & Checklist

Living document. ✔️ = done · ☐ = pending. See [PLATFORM-ARCHITECTURE.md](./PLATFORM-ARCHITECTURE.md) for technical context.

---

## ✅ Completed

### Marketing & Public
- ✔️ Hero section with animated gradient orb
- ✔️ Features grid with hover glow trail
- ✔️ Pricing with featured-plan shimmer
- ✔️ Stats section with count-up animation
- ✔️ About page
- ✔️ Footer with gradient hairline + Logo
- ✔️ Privacy + Terms pages
- ✔️ Cookie consent banner
- ✔️ 404 NotFound with atmospheric background

### Authentication
- ✔️ Email + password signup/signin (Zod validated)
- ✔️ Password strength meter
- ✔️ Google OAuth
- ✔️ Forgot password + reset flow (`/reset-password`)
- ✔️ `AuthContext` with session sync
- ✔️ `ProtectedRoute` guard

### Dashboard
- ✔️ Project CRUD (create wizard, list, delete with confirm)
- ✔️ Search + sort (updated/name/status)
- ✔️ Template-based scaffolding on creation
- ✔️ Profile dropdown (Settings, Admin link, Sign out)

### Playground IDE
- ✔️ Resizable 2-pane layout
- ✔️ Sandpack live preview
- ✔️ File tree + code viewer + diff viewer
- ✔️ Right-pane toggle (preview / files / workflows)
- ✔️ Project rename inline
- ✔️ Top bar with status + actions

### AIKO AI Agent
- ✔️ Edge function `aiko-chat` with JWT validation + rate limiting
- ✔️ 8 sub-agents (architect, ui_builder, logic, debug, review, devops, security, testing)
- ✔️ Plan / Agent dual modes
- ✔️ Streaming SSE responses with embedded meta block
- ✔️ Project context injection (files, workflows, approved plan)
- ✔️ File change pipeline (parse → upsert → invalidate)
- ✔️ Completion sound on file changes

### Versioning
- ✔️ Snapshot system (`project_snapshots`)
- ✔️ Version history dropdown
- ✔️ Revert to snapshot

### Workflows
- ✔️ Node-based workflow canvas
- ✔️ Workflow list + viewer

### Admin Control Center
- ✔️ `/admin` route with `has_role` gate
- ✔️ Overview tab (KPIs, plan/status distribution, recent activity)
- ✔️ Users tab (paginated, search, role assign/revoke)
- ✔️ Projects tab (recent + status counts)
- ✔️ System tab with **live API health checker** (18 endpoints, 6 categories)
- ✔️ Edge functions: `admin-stats`, `admin-users`, `admin-manage-role`
- ✔️ Self-demotion + last-admin safeguards
- ✔️ `useIsAdmin` hook for nav visibility

### Payments
- ✔️ `MockCheckoutDialog` staging
- ✔️ `profiles.plan` column (free/pro/enterprise)

### Design System
- ✔️ HSL token-based palette
- ✔️ Aurora atmosphere utilities (`aurora`, `noise-grain`, `conic-border`, `bg-mesh`)
- ✔️ Keyframes (`aurora-drift`, `gradient-shift`, `border-shimmer`, `breathe`)
- ✔️ Animated SVG `<Logo />` brand mark + matching favicon
- ✔️ Framer Motion micro-interactions across landing
- ✔️ Theme applied to **every** page (Playground, Admin, Settings, About, ResetPassword, NotFound, Privacy, Terms)
- ✔️ `prefers-reduced-motion` respected

### Documentation
- ✔️ README.md rewrite
- ✔️ PLATFORM-ARCHITECTURE.md
- ✔️ TODO.md (this file)

---

## 🚧 In Progress / Next Up

- ☐ Full walk-through QA pass across every page (visual + functional)
- ☐ Verify aurora effects on low-end devices

---

## 🎯 High-Priority Roadmap

### Payments → Production
- ☐ Replace `MockCheckoutDialog` with real Stripe Checkout
- ☐ Edge function `stripe-checkout` (create session)
- ☐ Edge function `stripe-webhook` (sync `profiles.plan` on subscription events)
- ☐ Edge function `stripe-portal` (customer portal URL)
- ☐ Plan gating on premium features

### UX Polish
- ☐ Light / dark theme toggle in profile dropdown (respect gradient tokens)
- ☐ Smooth crossfade between modes

### SEO & Sharing
- ☐ Open Graph image (1200×630) using aurora identity
- ☐ Twitter card image
- ☐ Wire OG/Twitter meta into `index.html`
- ☐ JSON-LD structured data

---

## 💡 Nice-to-Have Enhancements

### Visual / Motion
- ☐ Animated cursor spotlight on hero/auth/dashboard
- ☐ Page transition animations between routes
- ☐ Scroll-driven parallax on landing

### Admin
- ☐ Auto-refresh interval for health checker (configurable)
- ☐ Real-time activity feed in Overview (Supabase Realtime)
- ☐ Projects tab: search + pagination
- ☐ Export users / projects to CSV
- ☐ Bulk role operations

### Product
- ☐ Email notifications (transactional via Resend / SES)
- ☐ Team / workspace collaboration
- ☐ Project templates marketplace
- ☐ Export project as ZIP
- ☐ One-click GitHub push
- ☐ Mobile-optimized Playground layout
- ☐ Keyboard shortcuts overlay (`?` to open)
- ☐ Onboarding tour for new users
- ☐ In-app changelog / "What's new"

### AI
- ☐ Per-user AI usage quotas + UI
- ☐ Model picker (Gemini / GPT-5 family)
- ☐ Inline file edits with accept/reject diff
- ☐ AI-generated commit messages on snapshot

---

## 🔒 Security & Hardening

- ☐ Rate limiting on all admin edge functions (not just `aiko-chat`)
- ☐ Audit log table for admin actions (`audit_log`)
- ☐ 2FA / TOTP support
- ☐ Session device management (list + revoke)
- ☐ CAPTCHA on signup
- ☐ Content Security Policy (CSP) headers
- ☐ Pen-test pass on all edge functions

---

## 📊 Analytics & Observability

- ☐ Product analytics (PostHog or Plausible)
- ☐ Error tracking (Sentry)
- ☐ Performance monitoring dashboard
- ☐ Conversion funnel: visit → signup → first project → first AI message
- ☐ Admin tab: usage trends (daily/weekly/monthly active)

---

## 🧪 Testing & Quality

- ☐ Vitest unit tests for hooks (`useChat`, `useProject`, `useIsAdmin`)
- ☐ Component tests for critical flows (Auth, Pricing CTA, Admin role change)
- ☐ Playwright E2E: signup → create project → chat → revert
- ☐ CI workflow (lint + typecheck + test) on every push
- ☐ Lighthouse budget enforcement

---

## 📚 Documentation

- ☐ Per-component JSDoc for public hooks
- ☐ Storybook for `components/ui` primitives
- ☐ User-facing help center / FAQ page
- ☐ API reference for edge functions
- ☐ Contributing guide

---

_Last updated: 2026-04-21_
