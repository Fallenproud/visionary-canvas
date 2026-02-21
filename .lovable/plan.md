

# AIKO - AI-Powered Mobile Application Builder

## Vision

Transform the current AIKO landing page into a fully functional AI-powered mobile application builder where users can describe what they want, and AIKO (the AI assistant) scaffolds, previews, and iterates on mobile apps through a chat-based interface -- all within the browser.

---

## Architecture Overview

The platform has two sides:
1. **Marketing site** (already built) -- landing page, pricing, auth
2. **App Builder** (the playground) -- the core product users access after login

```text
+--------------------------------------------------+
|  AIKO Platform                                    |
|                                                   |
|  Marketing (existing)    App Builder (new)         |
|  /                       /playground               |
|  /about                  /playground/:projectId    |
|  /auth                   /dashboard                |
|  /pricing                /settings                 |
|                          /admin                    |
+--------------------------------------------------+
|  Backend (Lovable Cloud)                          |
|  - Auth (Supabase)                                |
|  - Database (profiles, projects, messages, etc.)  |
|  - Edge Functions (AI chat, code gen)             |
|  - Storage (project files, assets)                |
+--------------------------------------------------+
```

---

## Phase 1: Backend Foundation

### 1.1 Enable Lovable Cloud
- Activate Lovable Cloud for database, auth, storage, and edge functions
- Enable Lovable AI for the AIKO assistant

### 1.2 Database Schema

**profiles** -- user profile data linked to auth.users
- id (uuid, FK to auth.users)
- display_name (text)
- avatar_url (text)
- plan (text: free/pro/enterprise)
- onboarding_completed (boolean)
- created_at, updated_at

**user_roles** -- role-based access (separate table per security rules)
- id (uuid)
- user_id (uuid, FK to auth.users)
- role (enum: admin, moderator, user)

**projects** -- user's mobile app projects
- id (uuid)
- user_id (uuid, FK to auth.users)
- name (text)
- description (text)
- framework (text: react-native, expo)
- status (text: draft, building, ready, archived)
- file_tree (jsonb) -- scaffolded file structure
- settings (jsonb) -- project config
- created_at, updated_at

**conversations** -- chat sessions per project
- id (uuid)
- project_id (uuid, FK to projects)
- user_id (uuid, FK to auth.users)
- title (text)
- mode (text: plan, agent)
- created_at

**messages** -- individual chat messages with memory
- id (uuid)
- conversation_id (uuid, FK to conversations)
- role (text: user, assistant, system)
- content (text)
- metadata (jsonb) -- agent status, tool calls, thinking steps
- created_at

**project_files** -- generated code files per project
- id (uuid)
- project_id (uuid, FK to projects)
- file_path (text)
- content (text)
- language (text)
- version (integer)
- created_at, updated_at

### 1.3 RLS Policies
- Users can only access their own profiles, projects, conversations, messages, and files
- Admins can access all data via has_role() security definer function
- project_files readable only by project owner

---

## Phase 2: Authentication Integration

### 2.1 Replace Mock Auth with Supabase Auth
- Update `/auth` page to use `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`
- Add `onAuthStateChange` listener in a global AuthProvider context
- Add password reset flow with `/reset-password` route
- Create auto-profile-creation trigger on signup
- Add protected route wrapper component for authenticated pages

### 2.2 Auth Context
- `AuthProvider` wrapping the app with user state
- `useAuth()` hook exposing user, session, signOut, loading states
- Route guards redirecting unauthenticated users to `/auth`

---

## Phase 3: Dashboard

### 3.1 Dashboard Page (`/dashboard`)
- Grid of user's projects with name, status, last modified
- "New Project" button opening a creation wizard
- Project cards with actions: Open, Rename, Delete, Duplicate
- Quick stats: total projects, active builds, plan usage

### 3.2 New Project Wizard
- Step 1: Name and description
- Step 2: Choose framework (React Native / Expo -- Expo recommended as default)
- Step 3: Choose starter template (blank, tabs, drawer nav, etc.)
- On create: scaffold the boilerplate file tree into `project_files` and `file_tree`

---

## Phase 4: The Playground (Core Builder)

### 4.1 Layout (`/playground/:projectId`)

```text
+----------------------------------+------------------+
|  File Tree    |  Code Editor     |  Preview Panel   |
|  (sidebar)    |  (center)        |  (right)         |
|               |                  |                  |
|  src/         |  App.tsx         |  [Phone Frame]   |
|   screens/    |  ............    |  [Sandpack]      |
|   components/ |  ............    |                  |
|   navigation/ |  ............    |                  |
|               |                  |                  |
+---------------+------------------+------------------+
|  AIKO Chat Panel (bottom or collapsible side)       |
|  [Plan | Agent toggle]  [input] [send]              |
+-----------------------------------------------------+
```

### 4.2 Key Components
- **FileTree** -- collapsible tree showing project structure, click to open file in editor
- **CodeEditor** -- read-only code viewer with syntax highlighting (using a lightweight library like `react-syntax-highlighter` or `@uiw/react-textarea-code-editor`)
- **PreviewPanel** -- Sandpack-based live preview rendering the project in a phone-frame mockup
- **ChatPanel** -- the AIKO conversation interface

### 4.3 Sandpack Integration
- Install `@codesandbox/sandpack-react`
- Configure with Expo/React Native Web template
- Feed project files from `project_files` table into Sandpack's `files` prop
- Live-reload as AI generates/modifies code

### 4.4 Boilerplate Templates
Pre-built file trees stored as JSON templates:

**Expo Blank Template:**
```text
App.tsx
app.json
package.json
babel.config.js
src/
  screens/
    HomeScreen.tsx
  components/
    .gitkeep
  navigation/
    AppNavigator.tsx
  hooks/
    .gitkeep
  utils/
    .gitkeep
  assets/
    .gitkeep
```

Each template includes pre-configured `package.json` with proper dependencies (expo, react-native, react-navigation, etc.) so the AI agent does less scaffolding work.

---

## Phase 5: AIKO AI Assistant

### 5.1 Edge Function: `aiko-chat`
- Receives messages array + project context (file tree, current file, project settings)
- Uses Lovable AI gateway (`google/gemini-3-flash-preview`)
- System prompt identifies the assistant as "AIKO" with mobile app building expertise
- Supports streaming responses via SSE
- Returns structured tool calls for code modifications

### 5.2 Agent Modes (Toggle in Chat Input)

**Plan Mode:**
- AIKO analyzes the request and produces a step-by-step plan
- No code changes are made
- User reviews and approves before execution
- Visual indicators: "Planning..." with a thinking animation

**Agent Mode:**
- AIKO directly writes/modifies code files
- Shows real-time status indicators:
  - "Thinking..." (analyzing request)
  - "Writing src/screens/HomeScreen.tsx..." (generating code)
  - "Updating navigation..." (modifying files)
  - "Done" (complete)
- Automatically updates Sandpack preview after changes

### 5.3 Sub-Agents (Specialized Roles)
The system prompt routes tasks to specialized behaviors:

| Sub-Agent | Role | Trigger |
|-----------|------|---------|
| Architect | Project structure, navigation, folder organization | "scaffold", "set up", "create project" |
| UI Builder | Screen layouts, components, styling | "build screen", "add button", "style" |
| Logic Agent | State management, API calls, hooks | "add logic", "fetch data", "handle state" |
| Debug Agent | Error analysis, fix suggestions | "fix", "error", "not working" |
| Review Agent | Code review, best practices, optimization | "review", "optimize", "improve" |

These are not separate edge functions -- they are prompt-routing strategies within a single `aiko-chat` function using different system prompt sections based on detected intent.

### 5.4 AI Status Indicators
Visual feedback in the chat UI:
- Pulsing dot + "AIKO is thinking..." (during API call)
- File icon + "Writing HomeScreen.tsx..." (during code generation)
- Check icon + "Changes applied" (after completion)
- Brain icon + "Planning approach..." (in plan mode)

### 5.5 Conversation Memory
- All messages stored in `messages` table with `conversation_id`
- Full history sent to AI on each request (within token limits)
- Project file context included as system message
- Conversation list in sidebar for switching between threads

---

## Phase 6: File Management

### 6.1 File Operations
- Create, read, update, delete files through AIKO or manually
- Version tracking via `version` column on `project_files`
- File tree auto-updates in sidebar when AI creates/modifies files

### 6.2 Code Updates from AI
When AIKO generates code:
1. Parse the AI response for code blocks with file paths
2. Upsert into `project_files` table
3. Update `file_tree` JSON on the project
4. Push updated files to Sandpack for live preview
5. Show diff indicator in file tree for changed files

---

## Phase 7: Settings and Admin

### 7.1 Settings Page (`/settings`)
- Profile editing (display name, avatar)
- Plan management (current plan, upgrade CTA)
- API usage stats
- Account deletion

### 7.2 Admin Page (`/admin`) -- admin role only
- User management table
- Project statistics
- System health overview

---

## Phase 8: Navigation and Routing Updates

### 8.1 Updated Route Structure
```text
/                    -- Landing page (existing)
/about               -- About page (existing)
/auth                -- Login/Register (update to real auth)
/reset-password      -- Password reset
/dashboard           -- User's project list (protected)
/playground/:id      -- Builder workspace (protected)
/settings            -- User settings (protected)
/admin               -- Admin panel (protected + admin role)
```

### 8.2 Navigation Updates
- After login, redirect to `/dashboard` instead of `/`
- Add "Dashboard" link in nav for authenticated users
- Show user avatar + dropdown menu when logged in
- Mobile hamburger menu for responsive nav

---

## New Dependencies Required

| Package | Purpose |
|---------|---------|
| `@codesandbox/sandpack-react` | Live code preview in browser |
| `@supabase/supabase-js` | Backend integration |
| `react-syntax-highlighter` | Code display with syntax highlighting |
| `react-markdown` | Render AI markdown responses |
| `react-resizable-panels` | Playground layout panels |

Note: `react-resizable-panels` is already installed.

---

## New Files to Create

```text
src/
  integrations/supabase/         -- auto-generated by Cloud
  contexts/
    AuthContext.tsx               -- auth state provider
  hooks/
    useAuth.ts                   -- auth convenience hook
    useProject.ts                -- project CRUD operations
    useChat.ts                   -- AIKO chat + streaming
    useProjectFiles.ts           -- file CRUD operations
  components/
    ProtectedRoute.tsx           -- auth guard wrapper
    playground/
      FileTree.tsx               -- file explorer sidebar
      CodeViewer.tsx             -- syntax-highlighted code
      PreviewPanel.tsx           -- Sandpack preview in phone frame
      ChatPanel.tsx              -- AIKO chat interface
      ChatMessage.tsx            -- single message bubble
      AgentStatusIndicator.tsx   -- thinking/writing/done states
      ModeToggle.tsx             -- Plan vs Agent toggle
      PlaygroundLayout.tsx       -- resizable panel layout
    dashboard/
      ProjectCard.tsx            -- project grid card
      NewProjectWizard.tsx       -- project creation flow
    settings/
      ProfileForm.tsx            -- edit profile
      PlanCard.tsx               -- current plan display
  pages/
    Dashboard.tsx                -- project list
    Playground.tsx               -- builder workspace
    Settings.tsx                 -- user settings
    Admin.tsx                    -- admin panel
    ResetPassword.tsx            -- password reset
  lib/
    templates.ts                 -- boilerplate file trees
    agent-prompts.ts             -- system prompts for sub-agents
    sandpack-config.ts           -- Sandpack setup helpers
  types/
    project.ts                   -- TypeScript types
    chat.ts                      -- message/conversation types

supabase/functions/
  aiko-chat/index.ts             -- AI chat edge function
```

---

## Implementation Order

1. Enable Lovable Cloud and Lovable AI
2. Create database schema (tables, RLS, triggers)
3. Build AuthContext and replace mock auth
4. Create Dashboard page with project CRUD
5. Build Playground layout with resizable panels
6. Integrate Sandpack for live preview
7. Build AIKO chat panel with streaming
8. Implement Plan/Agent mode toggle
9. Create file tree and code viewer
10. Wire up AI code generation to file updates and preview
11. Add settings and admin pages
12. Polish status indicators and responsive design

---

## Technical Notes

- Sandpack runs entirely in-browser using WebAssembly -- no server VM needed for previews
- React Native Web allows previewing mobile components in a browser iframe
- The boilerplate template approach reduces AI token usage per project since the framework files are pre-scaffolded
- Conversation memory is bounded: only the last N messages plus a project context summary are sent to the AI to stay within token limits
- All AI interactions go through the `aiko-chat` edge function, never directly from client to AI gateway

