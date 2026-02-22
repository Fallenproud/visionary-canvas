

# AIKO Backend Overhaul + Master System Prompt + Sub-Agent Architecture

## Current State Assessment

### Backend Wiring (What Works)
- Edge function `aiko-chat` exists with CORS, auth validation, rate limiting, streaming SSE
- Database tables: `conversations`, `messages`, `projects`, `project_files`, `project_snapshots`, `profiles`, `user_roles`
- `LOVABLE_API_KEY` secret is configured
- Client-side: `useChat.ts` handles streaming, file saving, retry logic
- Code parser extracts `lang:filepath` blocks and upserts to `project_files`
- Plan versioning works (`.aiko/plans/vN.md`)
- Workflow auto-generation is instructed in the prompt

### Backend Issues Found
1. **`supabase.auth.getClaims()`** is not a standard Supabase JS method -- this may fail silently or throw depending on SDK version. Should use `supabase.auth.getUser(token)` instead
2. **`var sseMeta`** uses `var` declaration (line 366) which leaks scope -- should be `let`
3. **System prompt is weak** -- current prompt is a friendly chatbot persona, not the production-grade senior engineer described in the user's specification
4. **Sub-agents lack proper role definition** -- current prompts are thin 4-line descriptions, not the comprehensive role definitions needed
5. **Missing sub-agents** -- no `devops`, `security`, or `testing` sub-agents
6. **No AGENT_RULES enforcement** -- the scaffold locking concept has no implementation
7. **Router model** uses `gemini-2.5-flash-lite` (cheapest/weakest) -- adequate for routing but could be upgraded
8. **Project files sent to AI are capped at 10** (line 169 in useChat.ts) -- may miss critical context

---

## Plan

### Part 1: Replace AIKO System Prompt (Master Core)

Replace the current friendly-chatbot prompt in `supabase/functions/aiko-chat/index.ts` with the full production-grade Master Core prompt provided by the user. Key characteristics:
- Identity: elite AI product engineer, not a chatbot
- Tone: concise, confident, senior-level, no filler
- Two modes: Plan (structured outline) and Agent (file generation)
- Code block format enforcement: `---` divider then code blocks
- Safety rules: never delete without confirmation, never expose secrets
- Project context awareness: respects existing architecture
- Plan file integration: treats `.aiko/plan.md` as roadmap
- Visual platform awareness: ensures preview compiles

### Part 2: Expanded Sub-Agent Roles (8 agents)

Upgrade from 5 thin sub-agents to 8 comprehensive role-based agents:

| Agent | Role | New? |
|-------|------|------|
| `architect` | System design, folder structure, dependency management, scalability | Enhanced |
| `ui_builder` | Visual components, responsive design, accessibility, animations | Enhanced |
| `logic` | State management, API integration, hooks, form handling | Enhanced |
| `debug` | Root cause analysis, minimal fixes, performance bottlenecks | Enhanced |
| `review` | Code quality, security audit, DRY, performance optimization | Enhanced |
| `devops` | Build config, environment setup, deployment, CI/CD guidance | **NEW** |
| `security` | Auth flows, RLS policies, input sanitization, secret management | **NEW** |
| `testing` | Test strategy, edge cases, validation, error boundary coverage | **NEW** |

Each agent gets a 15-20 line comprehensive prompt with:
- Identity statement
- Focus areas (4-6 bullets)
- Quality checklist
- Output format specification
- Handoff instructions (what to pass to next agent)

### Part 3: Agent Delegation and Pass-Through

Update the router to support agent chaining:
- Router output includes `handoff` field: what context to pass between agents
- System prompt instructs AIKO to address each sub-agent's focus in order
- Add `approach` summary that explains the pipeline to the user via SSE meta
- Update keyword patterns to detect `devops`, `security`, and `testing` intents

### Part 4: Backend Fixes

**File: `supabase/functions/aiko-chat/index.ts`**
1. Replace `supabase.auth.getClaims(token)` with `supabase.auth.getUser(token)` for proper auth validation
2. Fix `var sseMeta` to `let sseMeta`
3. Increase project file context cap from 10 to 20 (in the edge function instruction, though the cap is client-side)

**File: `src/hooks/useChat.ts`**
4. Increase project file slice from 10 to 25 for richer context
5. Add the `devops`, `security`, `testing` agent names to the SSE meta status display

### Part 5: Scaffold Lock System (AGENT_RULES)

Add scaffold awareness to the system prompt so AIKO knows which files are read-only infrastructure:
- `package.json`, `tsconfig.json`, `vite.config.ts` -- never regenerate
- `ErrorBoundary.tsx`, `styles.css` reset -- always preserve
- `.aiko/*` system folder -- respect, never overwrite plan without approval
- UI components (`Button.tsx`, `Card.tsx`) -- reuse, don't recreate

This is enforced via prompt instructions (not filesystem locks), telling AIKO to treat these as locked unless user says "modify core scaffold".

### Part 6: Clean Up Deprecated Client-Side File

**File: `src/lib/agent-prompts.ts`**
- Remove this deprecated file entirely (no imports reference it)

---

## Files Modified

```text
supabase/functions/aiko-chat/index.ts   [MODIFIED] - New master prompt, 8 sub-agents, auth fix, var fix
src/hooks/useChat.ts                     [MODIFIED] - Increase file context cap to 25
src/lib/agent-prompts.ts                 [DELETED]  - Remove deprecated file
```

## Technical Details

### Auth Fix (edge function line 253)
```
// BEFORE (potentially broken):
const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

// AFTER (standard Supabase method):
const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
```

### New Sub-Agent: devops
Handles build configuration, environment variables, deployment readiness, bundle optimization, and CI/CD pipeline guidance.

### New Sub-Agent: security
Handles authentication flows, RLS policy design, input sanitization, secret management, CORS configuration, and XSS/injection prevention.

### New Sub-Agent: testing
Handles test strategy, edge case identification, validation logic, error boundary coverage, and user flow verification.

### Router Pattern Updates
Add keyword detection for new agents:
- `devops`: `/deploy/i, /build/i, /config/i, /env/i, /ci/i, /cd/i, /bundle/i`
- `security`: `/security/i, /auth/i, /rls/i, /policy/i, /permission/i, /secret/i, /xss/i`
- `testing`: `/test/i, /spec/i, /edge case/i, /validate/i, /assert/i, /coverage/i`

### Scaffold Lock Rules (in system prompt)
AIKO will be instructed to never modify these without explicit user request:
- `package.json`, `tsconfig.json`, `vite.config.ts`
- `/styles.css` (global reset)
- `ErrorBoundary.tsx`
- `.aiko/` system folder
- `/components/Button.tsx`, `/components/Card.tsx` (base UI)

---

## What This Does NOT Touch
- PreviewPanel (desktop fix is separate and already applied)
- Database schema (no migrations needed)
- Frontend UI components
- Auth flow
- Any page components

