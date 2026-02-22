

# AI Enhancements, Plan Versioning, Workflow Auto-Generation, Editable Explorer, and Version Control Relocation

## Overview

This plan covers 7 enhancements organized into 4 phases. Each phase is self-contained, testable, and does not break the existing code structure.

---

## Phase 1: Plan Versioning and Approval Event Logging

**Goal:** Keep a history of all approved plans and log approval events as message metadata.

### File Tree

```text
src/
  hooks/
    useChat.ts                      [MODIFIED] - Include plan version counter on approval
  pages/
    Playground.tsx                  [MODIFIED] - Version plans as /.aiko/plans/v{N}.md, log approval metadata
  types/
    chat.ts                         [MODIFIED] - Add plan_version to Message metadata type
```

### Subtasks

1. **Plan versioning**: On plan approval in `Playground.tsx`, instead of only upserting `/.aiko/plan.md`, also insert a timestamped version file at `/.aiko/plans/v{N}.md` (query existing plan files to determine N). The latest is always mirrored to `/.aiko/plan.md` for the AI's roadmap context.
2. **Approval event logging**: When a plan is approved, insert a system-level message into the conversation with `metadata: { event: "plan_approved", plan_version: N, timestamp }`. This gives the AI and the user a traceable approval history in the chat timeline.
3. **Update `Message.metadata` type** in `src/types/chat.ts` to include optional `event`, `plan_version` fields.

---

## Phase 2: Plan-to-Execution Diff View and Auto-Generated Workflows

**Goal:** After execution, show a diff between what the plan proposed and what was actually done. Also enable AIKO to auto-generate workflow diagrams from approved plans.

### File Tree

```text
src/
  components/
    playground/
      PlanDiffViewer.tsx            [NEW] - Side-by-side or inline diff between plan and execution
      PlanCard.tsx                  [MODIFIED] - Add "View Diff" button post-execution
  hooks/
    useChat.ts                      [MODIFIED] - Track files_changed per execution, compare to plan file tree
  types/
    chat.ts                         [MODIFIED] - Add execution_summary to metadata
supabase/
  functions/
    aiko-chat/
      index.ts                      [MODIFIED] - Add workflow generation instruction to agent mode post-execution prompt
```

### Subtasks

1. **Execution tracking**: After agent mode completes and files are saved, build an `execution_summary` object: `{ planned_files: string[], actual_files: string[], added: string[], skipped: string[] }`. Derive `planned_files` by parsing the file tree section from `/.aiko/plan.md`. Store this in the assistant message metadata.
2. **PlanDiffViewer component**: A new component that receives the plan markdown and the execution summary. It renders a clean comparison showing:
   - Planned files vs. actually changed files
   - Checkmarks for completed items, warnings for skipped/extra files
   - Rendered as a collapsible section below the PlanCard after execution completes
3. **"View Diff" button**: Add a button to `PlanCard.tsx` footer (only visible after execution) that toggles the PlanDiffViewer.
4. **Auto-generate workflow from plan**: Update the edge function's agent-mode prompt to instruct AIKO: when it detects an approved plan that has phases/steps, it should also emit a workflow JSON file at `/.aiko/workflows/{plan-name}.json` with nodes representing each phase and edges showing the phase order. This happens automatically during code generation -- no separate call needed. The workflow type definitions already support this (`WorkflowNode`, `WorkflowEdge`).
5. **Connect workflows to agent mode**: When the AI executes in agent mode and a workflow exists for the current plan, include the workflow JSON in the system prompt context. This gives the AI awareness of the overall flow graph, not just the markdown plan. Add a line in the edge function that checks for `/.aiko/workflows/*.json` files and appends them as context.

---

## Phase 3: Editable File Explorer

**Goal:** Allow users to edit file content directly in the Explorer pane, toggled by a button inside the explorer.

### File Tree

```text
src/
  components/
    playground/
      CodeViewer.tsx                [MODIFIED] - Add edit mode with a textarea, save button
      FileTree.tsx                  [MODIFIED] - Add "Edit Mode" toggle button in the explorer header
  pages/
    Playground.tsx                  [MODIFIED] - Pass file update handler to CodeViewer
  hooks/
    useProject.ts                   [MODIFIED] - Reuse existing useUpdateProjectFile for saves
```

### Subtasks

1. **Edit toggle in FileTree header**: Add a small `Pencil` icon button next to the "Explorer" label in `FileTree.tsx`. Clicking it toggles an `isEditing` state that is passed up to the parent.
2. **Editable CodeViewer**: When `isEditing` is true, replace the `SyntaxHighlighter` with a `<textarea>` styled to match the dark code theme. Add a "Save" button (floppy disk icon) in the file path header bar. On save, call the existing `useUpdateProjectFile` mutation.
3. **Wire it up in Playground.tsx**: Pass the `isEditing` state and `onSaveFile` handler through to the explorer pane. The `onSaveFile` handler calls `useUpdateProjectFile.mutateAsync({ projectId, filePath, content })`.
4. **No toolbar clutter**: The edit toggle lives entirely within the Explorer pane header, not in the top bar or any other border.

---

## Phase 4: Relocate Version Control to Chat Pane Border

**Goal:** Move the Version History dropdown from the top playground bar to the chat pane's top border, freeing top bar space.

### File Tree

```text
src/
  pages/
    Playground.tsx                  [MODIFIED] - Remove VersionHistoryDropdown from top bar right zone
  components/
    playground/
      ChatPanel.tsx                 [MODIFIED] - Add VersionHistoryDropdown to the chat header, right-aligned next to AIKO title
```

### Subtasks

1. **Remove from top bar**: In `Playground.tsx`, remove `<VersionHistoryDropdown>` from the right zone of the top bar (lines 246-250). Keep `<PlaygroundActions />` in place.
2. **Add to chat pane header**: In `ChatPanel.tsx`, import `VersionHistoryDropdown` and render it in the existing header div (`px-4 py-3 border-b`), positioned on the right side using `ml-auto`. Pass the required props (`snapshots`, `isReverting`, `onRevert`) through from `Playground.tsx` as new ChatPanel props.
3. **Update ChatPanel props**: Add `snapshots`, `isReverting`, `onRevert` to `ChatPanelProps` interface.

---

## Complete File Tree of All Changes

```text
src/
  components/
    playground/
      ChatPanel.tsx                 [MODIFIED] - Add version history to chat header
      CodeViewer.tsx                [MODIFIED] - Add edit mode with textarea + save
      FileTree.tsx                  [MODIFIED] - Add edit toggle button in header
      PlanCard.tsx                  [MODIFIED] - Add "View Diff" button post-execution
      PlanDiffViewer.tsx            [NEW] - Plan vs execution comparison view
  hooks/
    useChat.ts                      [MODIFIED] - Execution summary tracking, plan file parsing
    useProject.ts                   [MODIFIED] - Reuse useUpdateProjectFile (no new code needed)
  pages/
    Playground.tsx                  [MODIFIED] - Plan versioning, version control relocation, edit mode wiring
  types/
    chat.ts                         [MODIFIED] - Add event, plan_version, execution_summary to metadata
supabase/
  functions/
    aiko-chat/
      index.ts                      [MODIFIED] - Auto-workflow generation prompt, workflow context injection
```

---

## Technical Details

### Plan Versioning
- Query `project_files` where `file_path LIKE '/.aiko/plans/v%.md'` to determine the next version number.
- Upsert both `/.aiko/plans/v{N}.md` (archive) and `/.aiko/plan.md` (active roadmap).
- No new database tables or migrations needed -- uses existing `project_files` with `onConflict: "project_id,file_path"`.

### Execution Summary Derivation
- Parse the `### File Tree` section from `/.aiko/plan.md` using a simple regex to extract file paths and their `[NEW]`/`[MODIFIED]` markers.
- Compare against the actual `files_changed` array from `applyCodeBlocks`.
- Store the diff object in the assistant message's `metadata.execution_summary`.

### Workflow Auto-Generation
- The edge function prompt instructs AIKO to emit a code block formatted as `json:/.aiko/workflows/{name}.json` containing the workflow structure.
- The existing `applyCodeBlocks` function in `useChat.ts` will automatically save this file to `project_files`.
- The existing `useWorkflows` hook will automatically pick it up and display it in the Workflows viewer.

### Editable CodeViewer
- Uses a monospace `<textarea>` with `bg-transparent`, matching the existing dark theme.
- Save triggers `supabase.from("project_files").upsert(...)` via the existing mutation hook.
- The edit toggle is a small icon button -- no layout disruption.

### Version Control Relocation
- The `VersionHistoryDropdown` component is self-contained and only needs its 3 props.
- Moving it into `ChatPanel` requires threading these props from `Playground.tsx`.
- The chat header already has a flex layout with `items-center gap-2.5`, so adding the dropdown with `ml-auto` positions it naturally on the right.

### What Does NOT Change
- Database schema (no migrations)
- Streaming protocol (still SSE)
- File structure and routing
- Preview panel, Sandpack config
- Authentication flow
- Top bar left/center zones (toolbar and project name stay as-is)
- Workflow canvas component (already built)
- RightPaneToggle (already has 3 tabs)

