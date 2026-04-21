# AIKO — Platform Architecture

A deep technical reference for the AIKO platform. For a high-level overview, see [README.md](./README.md). For roadmap, see [TODO.md](./TODO.md).

---

## 1. System Overview

```
            ┌─────────────────────────────────────────────────────┐
            │                     PUBLIC WEB                       │
            │    Hero · Features · Pricing · Stats · About         │
            └────────────────────────┬────────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   /auth (Public)    │
                          │ Email · Google OAuth│
                          └──────────┬──────────┘
                                     │  (ProtectedRoute)
                ┌────────────────────┼────────────────────┐
                ▼                    ▼                    ▼
        ┌──────────────┐    ┌──────────────┐     ┌──────────────┐
        │  /dashboard  │    │  /settings   │     │    /admin    │
        │ Project CRUD │    │   Profile    │     │  (admin role)│
        └──────┬───────┘    └──────────────┘     └──────┬───────┘
               │                                          │
               ▼                                          ▼
   ┌────────────────────────┐               ┌──────────────────────────┐
   │  /playground/:id       │               │  Overview · Users        │
   │  ┌──────┐  ┌────────┐  │               │  Projects · System       │
   │  │ Chat │  │Preview │  │               │  (live API health check) │
   │  │AIKO  │  │ /Files │  │               └──────────────────────────┘
   │  └──┬───┘  └────────┘  │
   └─────┼──────────────────┘
         │
         ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │                   LOVABLE CLOUD (Supabase)                       │
   │  Postgres · RLS · Auth · Edge Functions · Storage · Realtime    │
   │                                                                  │
   │  Edge: aiko-chat ─► Lovable AI Gateway (Gemini / GPT-5)         │
   │  Edge: admin-stats · admin-users · admin-manage-role            │
   └─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Routing (`src/App.tsx`)

| Route | Component | Guard |
|---|---|---|
| `/` | `Index` (eager) | Public |
| `/about` | `About` (lazy) | Public |
| `/auth` | `Auth` (lazy) | Public |
| `/reset-password` | `ResetPassword` (lazy) | Public |
| `/privacy`, `/terms` | `Privacy`, `Terms` (lazy) | Public |
| `/dashboard` | `Dashboard` (lazy) | `ProtectedRoute` |
| `/playground/:id` | `Playground` (lazy) | `ProtectedRoute` |
| `/settings` | `Settings` (lazy) | `ProtectedRoute` |
| `/admin` | `Admin` (lazy) | `ProtectedRoute` + `has_role(admin)` |
| `*` | `NotFound` (lazy) | Public |

**Provider stack** (outer → inner): `ErrorBoundary` → `QueryClientProvider` → `AuthProvider` → `TooltipProvider` → `Toaster` + `Sonner` → `BrowserRouter` → `Suspense` → `Routes` → `CookieConsent`.

### 2.2 State Management

- **Server state**: TanStack Query (`@tanstack/react-query`). Query keys: `["projects"]`, `["project", id]`, `["project-files", id]`, `["admin-stats"]`, `["admin-users", search, page]`, `["snapshots", projectId]`, `["workflows", projectId]`.
- **Auth state**: `AuthContext` (`src/contexts/AuthContext.tsx`) — wraps `supabase.auth.onAuthStateChange` + `getSession`.
- **Local UI state**: `useState` / `useReducer` per component.
- **Realtime**: Supabase channels for messages/snapshots when needed.

### 2.3 Component Layers

```
pages/                  Top-level routes
  └─► components/       Feature components (Hero, Pricing, ChatPanel…)
        └─► components/ui/   shadcn primitives (Button, Dialog, Card…)
```

### 2.4 Performance Strategy

- **Lazy routes** (everything except `/`) via `React.lazy` + `Suspense` fallback (spinner).
- **ErrorBoundary** at app root catches render errors with a friendly fallback.
- **Code-splitting** is automatic per route.
- **GPU-only animations** — `transform`/`opacity`, never layout-triggering props.
- **`prefers-reduced-motion`** honored by all aurora/keyframe utilities.
- **Query caching** — default TanStack Query cache; manual `invalidateQueries` after mutations.

---

## 3. Backend Architecture (Lovable Cloud)

### 3.1 Database Schema

| Table | Purpose | Key Columns |
|---|---|---|
| `profiles` | Per-user profile + plan | `id (FK auth.users)`, `display_name`, `avatar_url`, `plan` (free/pro/enterprise), `onboarding_completed` |
| `user_roles` | Role assignments (RLS-safe) | `user_id`, `role` (`app_role` enum: admin/moderator/user) |
| `projects` | User projects | `id`, `user_id`, `name`, `description`, `framework` (react-native/expo), `status` (draft/building/ready/archived), `file_tree`, `settings` |
| `project_files` | Per-project files | `project_id`, `file_path`, `content`, `language`, `version` |
| `project_snapshots` | Versioned project state | `project_id`, `version`, `label`, `files (JSON)` |
| `conversations` | Chat sessions per project | `project_id`, `user_id`, `title`, `mode` (plan/agent) |
| `messages` | Chat messages | `conversation_id`, `role` (user/assistant/system), `content`, `metadata (JSON)` |

### 3.2 RLS Policy Summary

| Table | Read | Write |
|---|---|---|
| `profiles` | Self only | Self only |
| `user_roles` | Self can read own roles; admins read all (via `has_role`) | Admins only (via `admin-manage-role` edge function w/ service role) |
| `projects` | `user_id = auth.uid()` | `user_id = auth.uid()` |
| `project_files` | Owner of parent project | Owner of parent project |
| `project_snapshots` | Owner of parent project | Owner of parent project |
| `conversations` | Owner | Owner |
| `messages` | Owner of parent conversation | Owner of parent conversation |

### 3.3 Security-Definer Function

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles
                    where user_id = _user_id and role = _role) $$;
```

Used everywhere admin checks are needed — bypasses recursive RLS, never client-side.

### 3.4 Edge Functions Catalog

| Function | Auth | Purpose | I/O |
|---|---|---|---|
| `aiko-chat` | JWT-validated (manual, in-function) | Streams AI responses from Lovable AI Gateway with sub-agent routing, plan/agent modes, project context injection | In: `{messages, mode, projectFiles, workflows, plan}` · Out: SSE stream `data: …` |
| `admin-stats` | Bearer + `has_role(admin)` | Aggregate KPIs, recent activity, plan/role/status counts, storage buckets | Out: `{users, roles, projects, conversations, messages, recentUsers, recentProjects, storage, tableCounts}` |
| `admin-users` | Bearer + `has_role(admin)` | Paginated user list w/ email + roles, search by display_name | In: `?search=&page=&limit=` · Out: `{users, total, page, totalPages}` |
| `admin-manage-role` | Bearer + `has_role(admin)` | Assign / revoke roles with self-demotion + last-admin guards | In: `{action, user_id, role}` · Out: `{success: true}` |

All admin functions use the **service-role key** internally and gate by `has_role`.

---

## 4. AI System

### 4.1 Lovable AI Gateway

- Endpoint: `https://ai.gateway.lovable.dev/v1/chat/completions`
- Models used: `google/gemini-3-flash-preview` (default streaming), Gemini 2.5 Pro/Flash, GPT-5 family available.
- No user API key required.

### 4.2 Sub-Agent Architecture

8 specialized sub-agents in `aiko-chat`:

| Agent | Role |
|---|---|
| `architect` | High-level structure, file layout, data model |
| `ui_builder` | Components, styling, layout |
| `logic` | State, hooks, business logic |
| `debug` | Error diagnosis + fixes |
| `review` | Code review, refactoring suggestions |
| `devops` | Build, deploy, env, edge functions |
| `security` | RLS, auth, input validation |
| `testing` | Test scaffolding, edge cases |

**Routing**: keyword scoring (`detectSubAgents`) selects top 3, then a router LLM call (`plan_execution` tool) confirms the approach.

### 4.3 Plan / Agent Modes

- **Plan mode** — produces a structured plan only, written to `.aiko/plan.md`. User approves before execution.
- **Agent mode** — router → multi-step pipeline → streamed SSE response with embedded `: meta:` block (sub-agents, files changed, execution summary).

### 4.4 File Change Pipeline

`useChat` (`src/hooks/useChat.ts`) parses code blocks from streamed assistant messages → `applyCodeBlocks` upserts into `project_files` → `invalidateQueries(["project-files", projectId])` → optional snapshot creation → completion sound.

---

## 5. IDE / Playground

Layout (`src/pages/Playground.tsx`): **resizable 2-pane**.

- **Left**: `ChatPanel` — message history, plan card, mode toggle, status indicator, version history dropdown.
- **Right** (`RightPaneToggle`):
  - `PreviewPanel` — Sandpack live preview
  - `FileTree` + `CodeViewer` + `FileDiffViewer` — file explorer
  - `WorkflowViewer` + `WorkflowCanvas` — node-based flow diagrams

**Snapshots**: `useSnapshots` writes to `project_snapshots` (full files JSON + version + label). `VersionHistoryDropdown` lists them; revert calls `useRevertToSnapshot`.

---

## 6. Admin Control Center (`/admin`)

4 tabs in `src/pages/Admin.tsx`:

1. **Overview** (`AdminOverview`) — KPIs, plan distribution, project status, recent signups/projects.
2. **Users** (`AdminUsers`) — paginated table, search, role assign/revoke with confirmation dialog.
3. **Projects** (`AdminProjects`) — recent projects + status counts.
4. **System** (`AdminSystem`) — **live API health checker**: 18 endpoints across 6 categories (Auth, REST, RPC, Edge Functions, Storage, Realtime), `Promise.allSettled` with 10s timeout, latency + status code per check, infinite-scroll-safe rendering. Plus storage buckets, table row counts, platform config.

Gating: `Admin.tsx` calls `supabase.rpc("has_role", {_user_id, _role: "admin"})` — renders Access Denied otherwise. The `useIsAdmin` hook exposes the same check for nav visibility.

---

## 7. Auth Flow

`src/pages/Auth.tsx`:

- **Sign up / Sign in** — Supabase email + password (Zod-validated, password strength meter on signup).
- **Google OAuth** — `lovable.auth.signInWithOAuth("google")`.
- **Forgot password** — `supabase.auth.resetPasswordForEmail` with `redirectTo: /reset-password`.
- **Session sync** — `AuthContext` listens via `onAuthStateChange` and primes from `getSession()`.
- **Role gating** — `ProtectedRoute` redirects unauthenticated users to `/auth`. Admin tab/page additionally checks `has_role`.

---

## 8. Payments

**Current**: `MockCheckoutDialog` — Pricing CTAs trigger a staging dialog (no charges). `profiles.plan` already supports `free | pro | enterprise`.

**Planned Stripe path**:
1. `stripe--enable_stripe` to provision keys.
2. Edge function `stripe-checkout` → creates Checkout Session → returns URL.
3. Edge function `stripe-webhook` → updates `profiles.plan` on `checkout.session.completed` / `customer.subscription.updated`.
4. Edge function `stripe-portal` → returns Customer Portal URL.

---

## 9. Design System

### 9.1 Tokens (`src/index.css`)

All HSL, all semantic. Examples: `--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--gradient-start`, `--gradient-mid`, `--gradient-end`.

### 9.2 Aurora Atmosphere Utilities

| Utility | Purpose |
|---|---|
| `.bg-atmosphere` | Page-level deep gradient background |
| `.aurora` | Drifting animated radial-gradient blobs |
| `.noise-grain` | Subtle SVG film-grain overlay |
| `.conic-border` | Rotating conic shimmer border for premium cards |
| `.bg-mesh` | Breathing mesh gradient |
| `.gradient-text` | Tri-stop animated gradient text |
| `.glow-accent`, `.glow-accent-sm` | Multi-layer accent glow |
| `.glass` | Backdrop-blur glass card |

### 9.3 Keyframes

`aurora-drift` · `gradient-shift` · `border-shimmer` · `breathe`

### 9.4 Brand Mark

`src/components/Logo.tsx` — animated geometric "A" SVG with intersecting gradient strokes + aurora shimmer. Used in Navigation, Footer, Auth, Dashboard, Playground, Admin.

### 9.5 Motion

Framer Motion for page/card stagger, magnetic CTA hover, dropdown spring physics, parallax. All wrapped to respect `prefers-reduced-motion`.

---

## 10. Security Model

- ✅ **RLS-first** — every table has policies; client never trusts itself.
- ✅ **Service-role key** lives only in edge functions; never shipped to client.
- ✅ **Admin checks** always via `has_role` (server-side); no `localStorage` flags.
- ✅ **Self-demotion guard** — admin cannot revoke their own admin role.
- ✅ **Last-admin guard** — cannot remove the final admin.
- ✅ **JWT validation** in `aiko-chat` (manual, since `verify_jwt = false` for streaming).
- ✅ **Rate limiting** by `sub` claim in `aiko-chat`.
- ✅ **Input validation** with Zod on critical forms.
- ✅ **Path traversal prevention** in file operations.

---

## 11. Locked Scaffold

These files are auto-generated or platform-managed — **do not edit**:

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `.env`
- `supabase/migrations/**`
- `package-lock.json`, `bun.lock`, `bun.lockb`
- `.gitignore`

For changes to dependencies, use the `add_dependency` / `remove_dependency` tools. For schema changes, use migrations.

---

## 12. References

- [README.md](./README.md) — Product overview + quick start
- [TODO.md](./TODO.md) — Roadmap
- [Lovable Docs](https://docs.lovable.dev)
- [Supabase Docs](https://supabase.com/docs)
