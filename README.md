# AIKO — AI-Native App Builder

> Build production-ready apps by chatting with an AI agent. Marketing site + sandboxed IDE + admin control center, all in one platform.

**Live:** [aikov.lovable.app](https://aikov.lovable.app) · **Preview:** [id-preview--…lovable.app](https://id-preview--1648d44e-1ef1-4f65-b8bd-039a850d7805.lovable.app) · **Lovable Project:** [Open in Lovable](https://lovable.dev/projects/1648d44e-1ef1-4f65-b8bd-039a850d7805)

---

## What it is

AIKO is a **dual-sided platform**:

1. **Marketing Site** — Landing, pricing, about, auth, dashboard. The public face.
2. **AI App Builder** (`/playground/:id`) — A Sandpack-powered in-browser IDE where users chat with the **AIKO** AI agent (8 specialized sub-agents) to scaffold, edit, and ship React/React-Native apps. Includes snapshot-based version control and a visual workflow canvas.
3. **Admin Control Center** (`/admin`) — Full platform observability: live KPIs, user management, role delegation, project oversight, and a real-time API health checker covering every endpoint end-to-end.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18 · Vite 5 · TypeScript 5 · Tailwind CSS v3 · shadcn/ui |
| Motion | Framer Motion · custom CSS aurora/grain/conic utilities |
| IDE | Sandpack (CodeSandbox) |
| State | TanStack Query · React Context (Auth) |
| Backend | **Lovable Cloud** (Supabase: Postgres + Auth + Edge Functions + Storage + Realtime) |
| AI | **Lovable AI Gateway** (Gemini 3 Flash / Pro, GPT-5 family) |
| Auth | Email/password + Google OAuth + password reset |

## Feature Highlights

- 🤖 **AIKO chat agent** with 8 sub-agents (architect, ui_builder, logic, debug, review, devops, security, testing) and Plan/Agent dual modes
- 💻 **Sandboxed IDE** — file tree, code editor, live preview, diff viewer
- 📸 **Snapshot versioning** — revert any project to any prior state
- 🔀 **Workflow canvas** — node-based diagrams for app flows
- 🛡️ **Admin Control Center** — overview, users, projects, system health (18-endpoint live checker)
- 👥 **Role-based access** — `user` / `moderator` / `admin` with self-demotion + last-admin protections
- 💳 **Mock payment gateway** — staging-ready, drop-in Stripe path
- 🎨 **Aurora design system** — animated SVG logo, gradient tokens, atmospheric backgrounds, Framer micro-interactions

## Quick Start

```sh
git clone <YOUR_GIT_URL>
cd aiko
npm install
npm run dev
```

Environment variables (`.env`) are **auto-managed by Lovable Cloud** — you do not need to configure Supabase manually:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Project Structure

```
.
├── public/                      Static assets, favicon
├── src/
│   ├── components/              Feature components
│   │   ├── admin/               Admin tabs (Overview/Users/Projects/System)
│   │   ├── playground/          IDE: ChatPanel, FileTree, CodeViewer, etc.
│   │   └── ui/                  shadcn/ui primitives
│   ├── contexts/                AuthContext
│   ├── hooks/                   useChat, useProject, useIsAdmin, useAdminStats…
│   ├── integrations/            Auto-generated Supabase client + types (locked)
│   ├── lib/                     Utilities (chat-formatter, code-parser, templates…)
│   ├── pages/                   Index, Auth, Dashboard, Playground, Admin, Settings…
│   ├── types/                   Shared TS types
│   ├── index.css                Design tokens + aurora utilities + keyframes
│   └── App.tsx                  Router + providers
├── supabase/
│   ├── functions/               Edge functions (aiko-chat, admin-*)
│   ├── migrations/              DB migrations (locked)
│   └── config.toml              Project config
├── PLATFORM-ARCHITECTURE.md     Deep technical reference
├── TODO.md                      Roadmap checklist
└── README.md
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |

## Deployment

Open the [Lovable project](https://lovable.dev/projects/1648d44e-1ef1-4f65-b8bd-039a850d7805) → **Share → Publish**. Custom domains: **Project → Settings → Domains → Connect Domain** ([docs](https://docs.lovable.dev/features/custom-domain)).

## Documentation

- 📐 [**PLATFORM-ARCHITECTURE.md**](./PLATFORM-ARCHITECTURE.md) — Full system architecture, schema, security model
- ✅ [**TODO.md**](./TODO.md) — Completed work + forward roadmap
- 📚 [Lovable Docs](https://docs.lovable.dev)

---

Built with ❤️ on [Lovable](https://lovable.dev).
