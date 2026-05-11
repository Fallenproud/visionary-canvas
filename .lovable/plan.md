# Nice-to-Have Enhancements — Multi-Sprint Roadmap

A four-sprint plan to deliver every item under "Nice-to-Have Enhancements" in `TODO.md`. Each sprint is independently shippable, additive only, and preserves the current architecture, routing, and aurora visual system.

---

## Sprint 1 — Motion & Polish (Visual / Motion)

**Theme:** elevate perceived quality with cinematic micro-interactions. Zero structural changes.

**Scope**
- ☐ Animated cursor spotlight on hero, auth, and dashboard
- ☐ Page transition animations between routes
- ☐ Scroll-driven parallax on landing

**Deliverables**
- `src/components/effects/CursorSpotlight.tsx` — fixed `pointer-events-none` div, radial gradient that follows the cursor via `requestAnimationFrame`, throttled, hidden on touch devices, respects `prefers-reduced-motion`. Mounted inside Hero, Auth, and Dashboard wrappers.
- `src/components/effects/PageTransition.tsx` — wraps `<Routes>` content using Framer Motion `AnimatePresence` + `motion.div` (fade + 6px Y translate, 220ms). Mounted in `App.tsx` around the `<Routes>` block.
- Parallax: lightweight `useScrollParallax` hook applied to Hero aurora layers and Stats section background (translateY based on scroll Y, GPU-only `transform`, no layout reads).

**Guardrails**
- All effects gated behind `prefers-reduced-motion`.
- No new packages — Framer Motion is already installed.

---

## Sprint 2 — Admin Power Tools (Admin)

**Theme:** turn the Admin panel into an operational cockpit.

**Scope**
- ☐ Auto-refresh interval for health checker (configurable: off / 15s / 30s / 60s)
- ☐ Real-time activity feed in Overview (Supabase Realtime)
- ☐ Projects tab: search + pagination
- ☐ Export users / projects to CSV
- ☐ Bulk role operations

**Deliverables**
- **Health auto-refresh:** Select dropdown in `AdminSystem.tsx` header; `useEffect` interval that triggers the existing run-check function. Persisted in `localStorage`.
- **Realtime feed:** New `AdminActivityFeed` component on Overview tab subscribing to `postgres_changes` on `projects` and `conversations` (INSERT events). Rolling list of last 20 events with timestamps and aurora-styled rows.
  - Migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.projects, public.conversations;`
- **Projects search + pagination:** New edge function `admin-projects` (paginated, searchable by name/owner). Client uses React Query with `keepPreviousData`. Page size 25.
- **CSV export:** Client-side CSV builder (no deps) — buttons in Users and Projects tabs. Streams current filtered set; admin-only.
- **Bulk role ops:** Checkbox column in `AdminUsers.tsx`, sticky action bar ("Promote to moderator", "Revoke role"). New edge function `admin-bulk-roles` reusing `has_role` admin gate, last-admin safeguard, and per-row error reporting.

---

## Sprint 3 — Product Surface (Product)

**Theme:** broaden what users can do in-app.

**Scope**
- ☐ Email notifications (transactional via Resend)
- ☐ Team / workspace collaboration
- ☐ Project templates marketplace
- ☐ Export project as ZIP
- ☐ One-click GitHub push
- ☐ Mobile-optimized Playground layout
- ☐ Keyboard shortcuts overlay (`?` to open)
- ☐ Onboarding tour for new users
- ☐ In-app changelog / "What's new"

**Deliverables**
- **Email (Resend):** `email_domain--setup_email_infra` → scaffold transactional functions for: welcome, password reset confirmation, plan upgrade, project shared. Triggered from existing flows.
- **Workspaces:** New tables `workspaces`, `workspace_members(role)`, nullable `projects.workspace_id`. RLS via `is_workspace_member(_uid, _wid)` SECURITY DEFINER function. Workspace switcher in profile dropdown. Invite-by-email edge function.
- **Templates marketplace:** `project_templates` table (public read, admin write). New `/templates` route + "Use template" CTA in Dashboard create wizard. Seed with 6 starters.
- **Export ZIP:** Client-side using `jszip` (small dep) — bundles `project_files` rows; "Download ZIP" in Playground top bar.
- **GitHub push:** Edge function `github-push` using user-provided GitHub PAT (stored encrypted via secret per user → store in `user_integrations` table with RLS). Creates/updates a repo via REST API.
- **Mobile Playground:** Tab-based layout under `md` breakpoint (Chat | Preview | Files), replacing the resizable panes. Same components, conditional layout shell only.
- **Shortcuts overlay:** `Cmd/Ctrl+K` palette already exists pattern; add `?` global listener opening a Dialog listing all shortcuts grouped by area.
- **Onboarding tour:** Lightweight 4-step driver using a custom `OnboardingTour` component (no deps) — gated by `profiles.onboarding_completed`.
- **Changelog:** Static `src/data/changelog.ts` + `/changelog` route; toast badge in profile dropdown when `last_seen_changelog < latest`.

---

## Sprint 4 — AI Depth (AI)

**Theme:** richer agent capabilities and transparency.

**Scope**
- ☐ Per-user AI usage quotas + UI
- ☐ Model picker (Gemini / GPT-5 family)
- ☐ Inline file edits with accept/reject diff
- ☐ AI-generated commit messages on snapshot

**Deliverables**
- **Quotas:** New table `ai_usage(user_id, day, message_count, token_estimate)`. `aiko-chat` increments per call and rejects with 429 if over plan limit (free=50/day, pro=500/day, enterprise=∞). Settings page surfaces a usage meter.
- **Model picker:** Dropdown in Playground chat header — choices map to supported Lovable AI models (`google/gemini-2.5-pro`, `google/gemini-2.5-flash`, `openai/gpt-5`, `openai/gpt-5-mini`). Persisted per project in `projects.settings.preferred_model`. `aiko-chat` honors override.
- **Inline diff accept/reject:** Extend `FileDiffViewer` with per-hunk accept/reject buttons. Pending changes stored client-side until "Apply selected" commits via existing pipeline. Backed by a `pending_changes` ephemeral state in `useChat`.
- **AI commit messages:** When a snapshot is created, call `aiko-chat` (system prompt: "summarize file diffs in <60 chars") to generate the snapshot label. Used as default in Version History.

---

## Cross-Cutting Rules

- All new edge functions follow existing security pattern: in-code JWT validation, `has_role` admin checks where applicable, Zod input validation, CORS headers.
- All new tables ship with RLS enabled and explicit policies; roles always use the `user_roles` + `has_role` pattern — never stored on profiles.
- Visual additions reuse existing aurora/glass/gradient utilities — no new design tokens.
- Each sprint updates `TODO.md` (✔️ checkboxes) and adds an entry to the in-app changelog (after Sprint 3 lands).
- No edits to `src/integrations/supabase/client.ts` or `types.ts`.

## Sequencing & Estimates

| Sprint | Focus | Risk | Relative size |
|---|---|---|---|
| 1 | Motion polish | Low | S |
| 2 | Admin tools | Low–Med | M |
| 3 | Product surface | Med–High | L (likely split into 3a/3b in execution) |
| 4 | AI depth | Med | M |

Recommend executing Sprint 1 → 2 → 4 → 3, since Sprint 3 is the largest and benefits from quota infra (Sprint 4) being live first.

## Out of Scope (tracked separately in TODO.md)
- Security & Hardening section
- Analytics & Observability section
- Testing & Quality section
- Documentation section