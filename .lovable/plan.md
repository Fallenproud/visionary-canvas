

# Playground Upgrade: Top Bar, PlanCard, Workflow Diagrams, and Plan Persistence

## Overview

This plan covers five interconnected improvements to the Playground, implemented in three phases to avoid breaking anything. Each phase is self-contained and testable.

---

## Phase 1: Top Bar Redesign and Editable Project Name

### What Changes

The current top bar has: Back button | Divider | Icon + Project Name + Status Badge | (right) Version History.

Based on the reference images, the new top bar will be reorganized into three zones:

```text
|-- LEFT --|------------ CENTER ------------|-- RIGHT --|
| [Cloud] [Analytics] [Code] [Design] [...] | /playground/xxx [arrows] [refresh] | [Share] [GitHub] [Publish] |
```

**Left zone** -- 5 icon-only buttons in dark rounded squares:
1. Cloud (placeholder, shows "Coming Soon" tooltip)
2. Analytics/Chart (placeholder, "Coming Soon")
3. Code brackets (placeholder, "Coming Soon")
4. Design/palette (placeholder, "Coming Soon")
5. More/ellipsis (placeholder, "Coming Soon")

**Center zone** -- the existing project address bar (left as-is per instructions, no changes).

**Right zone** -- 3 action items:
1. Share button with user avatar (placeholder, "Coming Soon" toast)
2. GitHub icon button (placeholder, "Coming Soon" toast)
3. Publish button (blue filled, "Coming Soon" toast)

**Editable project name** -- The existing project name text in the top bar area becomes clickable. Clicking it reveals an inline input field. On blur or Enter, the name is saved to the database via `supabase.from("projects").update({ name })`.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Playground.tsx` | Restructure top bar into 3 zones, add editable project name, add toolbar icon buttons |
| `src/components/playground/PlaygroundToolbar.tsx` | **New file** -- Left-zone toolbar with 5 icon buttons and "Coming Soon" tooltips |
| `src/components/playground/PlaygroundActions.tsx` | **New file** -- Right-zone actions (Share, GitHub, Publish) with "Coming Soon" toasts |
| `src/hooks/useProject.ts` | Add `useUpdateProjectName` mutation hook |

### Subtasks
1. Create `PlaygroundToolbar.tsx` with 5 icon buttons (Cloud, TrendingUp, Code2, Palette, MoreHorizontal) using rounded-lg dark bg styling
2. Create `PlaygroundActions.tsx` with Share (avatar + text), GitHub (icon), Publish (blue button)
3. Restructure `Playground.tsx` top bar into flex with `justify-between` and 3 groups
4. Make the project name clickable with inline editing (input on click, save on blur/Enter)
5. Add `useUpdateProjectName` mutation to `useProject.ts`

---

## Phase 2: PlanCard Refinement and Plan Persistence

### What Changes (PlanCard)

Based on the reference image with red arrows, the following elements need to be removed/hidden from PlanCard:
- The **scrollbar track** on the right side (hide it, use invisible scrolling)
- The **progress bar/scrubber** at the bottom of the content area (remove step progress indicator bar)

Additional improvements:
- Replace the fixed `max-h-[280px]` with proper infinite scrolling using a ScrollArea component (hidden scrollbar, smooth scroll)
- The plan content should be structured with clear sections: File Tree, Phases with subtasks, and technical details
- Remove the horizontal step progress indicator (the numbered circles with connecting lines)

### What Changes (Plan Persistence)

When the user approves a plan:
1. The plan markdown content is saved as a `project_file` at the path `/.aiko/plan.md`
2. This file becomes part of the project's file system and is visible in the File Explorer
3. On subsequent AI calls, the plan file is automatically included in the context sent to the edge function so AIKO has a roadmap to follow

### What Changes (Plan Generation)

Update the edge function's plan-mode system prompt to instruct AIKO to produce plans with:
- A **File Tree** section showing what files will be created/modified
- **Phases** with numbered sub-tasks
- Clear structure using markdown headings

### Files Changed

| File | Change |
|------|--------|
| `src/components/playground/PlanCard.tsx` | Remove step progress indicator, hide scrollbar, use ScrollArea, increase max height, cleaner layout |
| `src/hooks/useChat.ts` | On plan approval, save plan content as `/.aiko/plan.md` project file; include plan file in context |
| `src/pages/Playground.tsx` | Pass projectId to ChatPanel for plan saving |
| `src/components/playground/ChatPanel.tsx` | Accept projectId prop, pass to plan approval handler |
| `supabase/functions/aiko-chat/index.ts` | Update plan-mode prompt to require file tree + phased structure |

### Subtasks
1. Refactor PlanCard: remove step progress indicator (numbered circles), hide the scrollbar using `scrollbar-hide` class, increase content area from 280px to 400px max
2. Add plan persistence: in `handlePlanApprove` flow, upsert `/.aiko/plan.md` into `project_files`
3. Update `useChat.sendMessage` to check for and include `/.aiko/plan.md` content in the `project_files` context
4. Update edge function plan-mode prompt to produce structured plans with file trees and phases

---

## Phase 3: Workflow Diagram Viewer

### What Changes

A new "Workflows" view is added to the right pane (alongside Preview and Explorer). This shows a list of stored workflow diagrams and allows previewing them.

**Workflow storage**: Workflows are stored as `project_files` with path pattern `/.aiko/workflows/*.json`. Each JSON file contains:
```text
{
  "id": "string",
  "name": "string", 
  "description": "string",
  "nodes": [{ "id", "label", "type", "x", "y" }],
  "edges": [{ "from", "to", "label" }]
}
```

**Workflow list**: A clickable sidebar list showing all stored workflows with hover states, descriptions, and active indicators.

**Workflow canvas**: A read-only node-to-node diagram renderer built with plain SVG/Canvas (no external dependency). Nodes are rendered as styled boxes with connecting edge lines. Supports:
- Pan and zoom via mouse/trackpad
- Hover state on nodes showing tooltips
- Color-coded node types (start, process, decision, end)

**Access point**: The existing `RightPaneToggle` gains a third option: "Workflows". This toggle is already positioned in the right pane and follows the existing pattern.

**Top bar integration**: One of the left-zone toolbar buttons (the analytics/chart icon) is wired to switch the right pane to "Workflows" view. For now, this is the only toolbar button with functionality; the others show "Coming Soon".

### Files Changed

| File | Change |
|------|--------|
| `src/components/playground/RightPaneToggle.tsx` | Add "Workflows" as a third toggle option |
| `src/components/playground/WorkflowViewer.tsx` | **New file** -- Main workflow viewer with list sidebar + canvas area |
| `src/components/playground/WorkflowCanvas.tsx` | **New file** -- SVG-based node-to-node diagram renderer with pan/zoom |
| `src/components/playground/WorkflowList.tsx` | **New file** -- Clickable list of workflows with hover states |
| `src/types/workflow.ts` | **New file** -- TypeScript interfaces for WorkflowNode, WorkflowEdge, Workflow |
| `src/hooks/useWorkflows.ts` | **New file** -- Hook to read workflow JSON files from project_files |
| `src/pages/Playground.tsx` | Expand rightPane state to include "workflows", render WorkflowViewer, wire toolbar button |

### Subtasks
1. Create `src/types/workflow.ts` with interfaces for Workflow, WorkflowNode, WorkflowEdge
2. Create `src/hooks/useWorkflows.ts` to query `project_files` where `file_path LIKE '/.aiko/workflows/%'` and parse JSON
3. Create `WorkflowList.tsx` -- a vertical scrollable list with hover highlights, active state, and empty state ("No workflows yet")
4. Create `WorkflowCanvas.tsx` -- an SVG renderer that draws nodes as rounded rectangles and edges as path lines with arrowheads; supports mouse-drag panning and scroll-wheel zoom; hover tooltips on nodes
5. Create `WorkflowViewer.tsx` -- split layout with WorkflowList on the left (30%) and WorkflowCanvas on the right (70%)
6. Update `RightPaneToggle.tsx` to include a third "Workflows" tab with a `GitBranch` icon
7. Update `Playground.tsx` to handle the new rightPane value, render WorkflowViewer, and wire the analytics toolbar button to switch to workflows view

---

## Complete File Tree of Changes

```text
src/
  components/
    playground/
      PlaygroundToolbar.tsx        [NEW] - Left-zone icon buttons
      PlaygroundActions.tsx         [NEW] - Right-zone Share/GitHub/Publish
      PlanCard.tsx                  [MODIFIED] - Remove progress bar, hide scrollbar, increase height
      RightPaneToggle.tsx           [MODIFIED] - Add "Workflows" third tab
      ChatPanel.tsx                 [MODIFIED] - Accept projectId, handle plan saving
      WorkflowViewer.tsx            [NEW] - Split layout: list + canvas
      WorkflowCanvas.tsx            [NEW] - SVG node-to-node renderer with pan/zoom
      WorkflowList.tsx              [NEW] - Clickable workflow list
  hooks/
    useProject.ts                   [MODIFIED] - Add useUpdateProjectName
    useChat.ts                      [MODIFIED] - Plan persistence on approval
    useWorkflows.ts                 [NEW] - Read workflow files from project_files
  pages/
    Playground.tsx                  [MODIFIED] - Top bar redesign, editable name, workflows pane
  types/
    workflow.ts                     [NEW] - Workflow type definitions
supabase/
  functions/
    aiko-chat/
      index.ts                      [MODIFIED] - Structured plan prompt with file tree + phases
```

---

## Technical Details

### Editable Project Name
- Uses controlled input with `useState` initialized from `project?.name`
- On blur or Enter keypress, calls `supabase.from("projects").update({ name }).eq("id", projectId)`
- Invalidates `["project", projectId]` query cache
- Shows a subtle border on hover to indicate editability

### Plan Persistence
- Uses existing `project_files` table (no migration needed)
- Upserts at path `/.aiko/plan.md` using the existing `onConflict: "project_id,file_path"` pattern
- The edge function already receives `project_files` in context, so the plan is automatically available to AIKO

### Workflow Canvas (SVG-based, zero dependencies)
- Pure SVG with `<rect>` for nodes, `<path>` for edges, `<text>` for labels
- Pan: track `mousedown`/`mousemove` on the SVG, translate the viewBox
- Zoom: `wheel` event adjusts viewBox dimensions
- Node types mapped to colors: start=green, process=blue, decision=amber, end=red
- Hover: CSS `:hover` on node groups with opacity/scale transitions
- No external charting or diagramming library required

### "Coming Soon" Pattern
- Toolbar buttons and action buttons wrap in a `Tooltip` showing "Coming Soon"
- On click, show `toast.info("Coming Soon!")` via sonner
- This is consistent with the existing toast usage in the codebase

