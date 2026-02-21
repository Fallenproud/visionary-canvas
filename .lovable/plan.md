

# Optimize AIKO Sub-Agent Workflow and PlanCard Component

## Overview

This plan upgrades AIKO's backend to use a proper **chain-of-thought sub-agent pipeline** (inspired by LangGraph/LangChain patterns) -- all implemented within the existing edge function architecture. No external libraries are needed; we implement the orchestration pattern directly using the Lovable AI gateway. The PlanCard also gets a visual and functional polish.

**Nothing breaks** -- same file structure, same DB schema, same streaming protocol. We're making the engine smarter without changing the car's body.

---

## What Changes

### 1. Enhanced Sub-Agent Orchestration (Edge Function)

**File:** `supabase/functions/aiko-chat/index.ts`

Currently, the sub-agent is just a label appended to the system prompt. The upgrade introduces a **two-phase pipeline** for Agent mode:

- **Phase 1 -- Router + Planner (non-streaming):** A fast, cheap call (`gemini-2.5-flash-lite`) analyzes the user's request and returns a structured JSON "execution plan": which sub-agents to invoke, in what order, and what each should focus on.
- **Phase 2 -- Executor (streaming):** The main model (`gemini-3-flash-preview`) receives the execution plan as additional system context and generates the final response with code.

For Plan mode, only a single call is made (no change from current behavior).

This gives AIKO the ability to:
- Chain multiple sub-agents (e.g., Architect then UI Builder for "create a todo app with nice design")
- Produce more focused, higher-quality code by giving the main model a structured brief
- Show the user which sub-agents were involved in metadata

The router call uses **tool calling** to extract structured output (no fragile JSON parsing).

### 2. Richer Sub-Agent Prompts

**File:** `supabase/functions/aiko-chat/index.ts` (inline, replacing the current slim prompts)

Each sub-agent prompt gets expanded with:
- Specific file patterns to generate (e.g., Architect creates folder structure, UI Builder creates components)
- Quality checklists (accessibility, error handling, etc.)
- Cross-agent handoff instructions

### 3. Smarter Sub-Agent Detection

**File:** `supabase/functions/aiko-chat/index.ts`

Replace the simple regex matcher with a more robust keyword/intent classifier that can detect **multiple** relevant sub-agents from a single message and returns them ranked by relevance.

### 4. Client-Side Status Improvements

**File:** `src/hooks/useChat.ts`

- Parse a new optional SSE comment line `:: sub_agents: [...]` emitted by the edge function to show which sub-agents are active
- Update `AgentStatus` detail text to reflect the current phase ("Analyzing request...", "Planning approach...", "Generating code...")

### 5. PlanCard Component Polish

**File:** `src/components/playground/PlanCard.tsx`

- Add a **Dismiss** button (X icon) alongside Edit/Approve so users can close plans they don't want
- Add a **step progress indicator** showing numbered steps extracted from the markdown
- Improve the loading skeleton with a shimmer effect instead of plain pulse
- Add a subtle gradient accent border on the left side for visual identity
- Sync `editContent` when `content` prop changes (bug fix -- currently stale if content streams in)

### 6. Cleanup Unused Client-Side Prompts

**File:** `src/lib/agent-prompts.ts`

This file contains outdated React Native prompts that are no longer used (the edge function has its own). Mark it as deprecated or remove the unused exports to avoid confusion. The `detectSubAgent` function here is also unused (the edge function has its own copy).

---

## Technical Details

### Router Tool Schema (Phase 1)

```text
Tool: plan_execution
Parameters:
  sub_agents: array of { name: string, focus: string }
  approach: string (1-2 sentence summary)
  complexity: "simple" | "moderate" | "complex"
```

### Edge Function Flow

```text
User Message
    |
    v
[Router Call] -- gemini-2.5-flash-lite, non-streaming
    |           Uses tool_choice to extract structured plan
    v
Execution Plan: { sub_agents, approach, complexity }
    |
    v
[Executor Call] -- gemini-3-flash-preview, streaming
    |           System prompt = AIKO base + sub-agent briefs + execution plan
    v
SSE Stream --> Client
```

### SSE Enhancement

The edge function will emit an optional comment line before the stream data begins:

```text
: meta:{"sub_agents":["architect","ui_builder"],"approach":"..."}
```

The client parses this to update the status indicator (non-breaking -- SSE comments are ignored by clients that don't handle them).

### Files Changed Summary

| File | Change |
|------|--------|
| `supabase/functions/aiko-chat/index.ts` | Two-phase pipeline, richer prompts, tool-calling router |
| `src/hooks/useChat.ts` | Parse SSE meta comments, richer status updates |
| `src/components/playground/PlanCard.tsx` | Dismiss button, step indicator, shimmer loading, accent border, sync fix |
| `src/lib/agent-prompts.ts` | Clean up unused exports |
| `src/types/chat.ts` | Add `sub_agents` array to AgentStatus type |

### What Does NOT Change

- Database schema (no migrations)
- Streaming protocol (still SSE, backward compatible)
- File structure and routing
- Preview panel, bezel, or any other UI components
- Authentication flow
- Sandpack configuration

