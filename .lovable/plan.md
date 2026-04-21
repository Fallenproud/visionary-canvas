

# Project Documentation Sprint

## Goal
Generate three comprehensive markdown documents at the project root that capture the full state, architecture, and forward roadmap of the AIKO platform — written from a top-tier engineering/PM lens, no code changes anywhere.

## Deliverables

### 1. `README.md` (rewrite)
Replace the default Lovable boilerplate with a real product README:
- **Hero**: AIKO tagline, live URLs (preview + published), one-line pitch
- **What it is**: Dual-sided platform (Marketing site + AI App Builder at `/playground/:id`)
- **Tech Stack**: React 18, Vite, TypeScript, Tailwind, shadcn/ui, Framer Motion, Sandpack, Supabase (Cloud), Lovable AI Gateway
- **Feature Highlights**: AI chat agent, sandboxed IDE, snapshot versioning, workflow canvas, admin control center, mock payments, role-based auth
- **Quick Start**: clone / install / dev / env vars (auto-managed by Cloud)
- **Project Structure**: top-level tree with one-line descriptions
- **Scripts**: dev, build, preview, lint
- **Deployment**: Lovable publish flow + custom domain note
- **Links**: Architecture doc, TODO doc, Lovable docs

### 2. `PLATFORM-ARCHITECTURE.md` (new)
Deep technical architecture reference:
- **System Overview**: ASCII diagram of Marketing → Auth → Dashboard → Playground → Admin flow
- **Frontend Architecture**:
  - Routing map (App.tsx) with protected vs public routes
  - State management (React Query + Context: Auth)
  - Component layers (pages → feature components → ui primitives)
  - Lazy loading strategy + ErrorBoundary + Suspense
- **Backend Architecture (Lovable Cloud / Supabase)**:
  - Database schema table (profiles, projects, project_files, project_snapshots, conversations, messages, user_roles)
  - RLS policy summary per table
  - `has_role` security-definer function + `app_role` enum
  - Edge functions catalog: `aiko-chat`, `admin-stats`, `admin-users`, `admin-manage-role` (purpose, auth model, inputs/outputs)
- **AI System**: Lovable AI Gateway, sub-agent architecture, Plan/Agent modes, file change pipeline
- **IDE / Playground**: Sandpack 2-pane layout, file tree, chat panel, snapshot/version system
- **Admin Control Center**: 4 tabs (Overview / Users / Projects / System), live API health checker, role delegation flow
- **Auth Flow**: Email + Google OAuth, password strength, reset flow, role gating
- **Payments**: MockCheckoutDialog staging → planned Stripe integration path
- **Design System**: Token-based HSL palette, aurora atmosphere utilities (`aurora`, `noise-grain`, `conic-border`, `bg-mesh`), keyframes (`aurora-drift`, `gradient-shift`, `border-shimmer`, `breathe`), Framer Motion micro-interactions, animated SVG Logo
- **Security Model**: RLS-first, service-role only in edge functions, self-demotion + last-admin protections, no client-side admin checks
- **Performance**: Lazy routes, GPU-only animations, prefers-reduced-motion respect, React Query caching
- **Locked Scaffold**: list of files that must not be edited

### 3. `TODO.md` (new)
Organized checklist using ✔️ for done and ☐ for pending, grouped by domain:

```
## ✅ Completed
- ✔️ Marketing site (Hero, Features, Pricing, Stats, Footer, About)
- ✔️ Authentication (email + Google OAuth, reset password)
- ✔️ Dashboard with project CRUD
- ✔️ Playground IDE (Sandpack, chat, file tree)
- ✔️ AIKO chat agent (8 sub-agents, Plan/Agent modes)
- ✔️ Snapshot versioning system
- ✔️ Workflow canvas
- ✔️ Admin Control Center (Overview / Users / Projects / System)
- ✔️ Live API health checker (18 endpoints, 6 categories)
- ✔️ Role delegation (user / moderator / admin) with safeguards
- ✔️ Mock payment gateway staging
- ✔️ Visual polish sprint (aurora theme, animated Logo, gradient tokens)
- ✔️ Theme applied across all pages (Playground, About, ResetPassword, etc.)

## 🚧 In Progress / Next Up
- ☐ Walk-through QA across every page

## 🎯 High-Priority Roadmap
- ☐ Real Stripe checkout (replace MockCheckoutDialog)
- ☐ Stripe webhooks → plan sync
- ☐ Customer portal for subscription management
- ☐ Light/dark theme toggle in profile dropdown
- ☐ OG / Twitter card images + meta tags

## 💡 Nice-to-Have Enhancements
- ☐ Animated cursor spotlight on hero/auth
- ☐ Auto-refresh interval for admin health checks
- ☐ Real-time activity feed in Admin Overview
- ☐ Projects tab: search + pagination
- ☐ Email notifications (transactional)
- ☐ Team/workspace collaboration
- ☐ Project templates marketplace
- ☐ Export project as ZIP / GitHub push
- ☐ Mobile-optimized Playground layout
- ☐ Keyboard shortcuts overlay
- ☐ Onboarding tour for new users

## 🔒 Security & Hardening
- ☐ Rate limiting on edge functions
- ☐ Audit log table for admin actions
- ☐ 2FA support
- ☐ Session device management

## 📊 Analytics & Observability
- ☐ Product analytics (PostHog / Plausible)
- ☐ Error tracking (Sentry)
- ☐ Performance monitoring dashboard
```

## Files Touched
| File | Action |
|------|--------|
| `README.md` | REWRITE |
| `PLATFORM-ARCHITECTURE.md` | CREATE |
| `TODO.md` | CREATE |

## Does NOT Touch
- ❌ No source code changes
- ❌ No backend / DB / edge function changes
- ❌ No package or config changes
- ❌ No routing / component / styling changes

Pure documentation deliverable.

