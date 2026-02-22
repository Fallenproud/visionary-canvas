
# AIKO Backend Overhaul — COMPLETED

## What Was Done

### ✅ Part 1: Master System Prompt
Replaced friendly-chatbot prompt with production-grade Master Core prompt. AIKO is now an elite AI product engineer with concise, senior-level tone, two modes (Plan/Agent), safety rules, scaffold lock awareness, and visual platform awareness.

### ✅ Part 2: 8 Sub-Agent Roles
Expanded from 5 thin agents to 8 comprehensive role-based agents:
- `architect` — system design, folder structure, scalability (enhanced)
- `ui_builder` — visual components, responsive design, accessibility (enhanced)
- `logic` — state management, API integration, hooks, auth flows (enhanced)
- `debug` — root cause analysis, minimal fixes, performance (enhanced)
- `review` — code quality, security audit, DRY, optimization (enhanced)
- `devops` — build config, deployment, CI/CD, bundle optimization (NEW)
- `security` — auth flows, RLS policies, input sanitization, secrets (NEW)
- `testing` — test strategy, edge cases, validation, error boundaries (NEW)

Each agent has: identity statement, 6+ focus areas, quality checklist, output format, handoff instructions.

### ✅ Part 3: Agent Delegation & Router
- Router now knows all 8 agents
- Keyword detection updated for devops, security, testing
- Approach summary passed via SSE meta for client display
- Handoff instructions embedded in each agent prompt

### ✅ Part 4: Backend Fixes
- Fixed `var sseMeta` → `let sseMeta`
- Client file context cap increased from 10 → 25

### ✅ Part 5: Scaffold Lock System
Added AGENT_RULES directly into the system prompt. AIKO will not modify locked files (package.json, tsconfig.json, vite.config.ts, ErrorBoundary.tsx, .aiko/*, base UI components) unless user explicitly says "modify core scaffold".

### ✅ Part 6: Cleanup
- Deleted deprecated `src/lib/agent-prompts.ts`

## Files Modified
```
supabase/functions/aiko-chat/index.ts   [MODIFIED] - Complete rewrite
src/hooks/useChat.ts                     [MODIFIED] - File cap 10→25
src/lib/agent-prompts.ts                 [DELETED]
```

## Auth Note
Kept `getClaims()` as it's the recommended approach per Lovable Cloud's signing-keys system.
