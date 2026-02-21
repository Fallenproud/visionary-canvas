

# Playground Polish: Plan Popup Card, Chat UI Refinement, and Visual Upgrade

This plan combines the previously approved polish (URL bar, chat input, welcome message, pane styling) with the new **Plan Popup Card** component -- a floating card that appears above the chat input when AIKO generates a plan, allowing the user to review, edit, or approve it.

---

## 1. Plan Popup Card (New Component)

**Inspired by the reference images:** A floating card that anchors above the chat input area.

**Behavior:**
- When `mode === "plan"` and the latest assistant message contains a plan, a popup card slides up above the input bar
- The card has a "Plan" header with a collapse/expand chevron icon
- The body shows the plan content rendered as Markdown (scrollable, max-height ~300px)
- The footer has two buttons: "Edit" (outline, white) and "Approve" (filled blue, with a dropdown chevron)
- Clicking "Approve" triggers the plan acceptance flow: sends a follow-up message to AIKO telling it to execute the plan in agent mode
- Clicking "Edit" allows the user to modify the plan text inline before approving
- The card is dismissible (collapse chevron minimizes it to just the header)

**Visual spec (from reference images):**
- Dark card with subtle border (`border-border/60`) and rounded corners (`rounded-xl`)
- "Plan" label in the header, top-left, with a chevron toggle top-right
- Separator line below header
- Content area with muted text, skeleton-like bars while loading
- Footer separator, then "Edit" (white outline button) and "Approve" (blue filled button with dropdown arrow) aligned right

**New file:** `src/components/playground/PlanCard.tsx`

---

## 2. Chat Types Update

**File:** `src/types/chat.ts`

Add a new type for tracking plan state:

```text
export interface PlanData {
  content: string;        // The plan markdown text
  isExpanded: boolean;    // Whether the card is expanded or collapsed
  isApproved: boolean;    // Whether user has approved the plan
}
```

---

## 3. ChatPanel.tsx Updates

**File:** `src/components/playground/ChatPanel.tsx`

Changes:
- Add `planData` state to track the latest plan from assistant messages
- Detect when the last assistant message was generated in "plan" mode (via `metadata.sub_agent === "plan"`) and extract its content into `planData`
- Render `PlanCard` component between the messages area and the input bar (positioned above input, with proper spacing)
- Enlarge the input bar: `rounded-3xl`, `p-3` padding, `min-h-[44px]` textarea
- Enhance the welcome message: `text-2xl font-bold` with shadow, larger AIKO icon with glow, `py-20` spacing
- When user clicks "Approve" on PlanCard, call `onSend("Approved plan: execute it", "agent")` to switch to agent mode and implement

---

## 4. PreviewPanel.tsx -- URL Bar and Visual Polish

**File:** `src/components/playground/PreviewPanel.tsx`

Changes:
- Add a browser-style URL bar at the top of the preview showing `/project/{id}` with Monitor, ExternalLink, and RefreshCw icons
- Enhance phone frame: `shadow-2xl`, softer `rounded-[2.5rem]`, inner glow
- URL bar sits above the phone frame, styled as `rounded-full bg-secondary/80 border`

---

## 5. Playground.tsx -- Pane and Top Bar Polish

**File:** `src/pages/Playground.tsx`

Changes:
- Add `backdrop-blur-sm` and subtle `shadow-sm` to the top bar
- Add `bg-secondary/10` background to the right pane container for visual depth
- Pass `projectId` to `ChatPanel` so the PlanCard can display `/project/{id}` context

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/playground/PlanCard.tsx` | Create | Plan popup card with header, markdown body, Edit/Approve footer |
| `src/types/chat.ts` | Modify | Add `PlanData` interface |
| `src/components/playground/ChatPanel.tsx` | Modify | Integrate PlanCard, enlarge input, polish welcome message |
| `src/components/playground/PreviewPanel.tsx` | Modify | Add URL bar, enhance frame styling |
| `src/pages/Playground.tsx` | Modify | Polish top bar and right pane backgrounds |

---

## Technical Details

### PlanCard.tsx Structure

```text
<div className="mx-3 mb-2">
  <div className="rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
      <span className="text-sm font-semibold text-foreground">Plan</span>
      <button onClick={toggleExpand}>
        <ChevronsUpDown className="w-4 h-4" />
      </button>
    </div>

    {/* Body -- collapsible */}
    {isExpanded && (
      <>
        <div className="px-4 py-3 max-h-[300px] overflow-y-auto">
          {isEditing ? (
            <textarea value={editContent} onChange={...} />
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/40">
          <button "Edit" -- outline white />
          <button "Approve" -- blue filled with dropdown chevron />
        </div>
      </>
    )}
  </div>
</div>
```

### PlanCard Props

```text
interface PlanCardProps {
  content: string;
  isLoading: boolean;
  onApprove: (content: string) => void;
  onDismiss: () => void;
}
```

### ChatPanel Integration

The PlanCard renders between the messages scroll area and the status/input area:

```text
<div className="flex flex-col h-full">
  <Header />
  <Messages />       {/* flex-1 overflow-y-auto */}
  {planData && <PlanCard ... />}   {/* anchored above input */}
  <StatusIndicator />
  <InputBar />        {/* enlarged, rounded-3xl */}
</div>
```

### Plan Detection Logic

In ChatPanel, detect plan content from messages:

```text
const latestPlan = messages.findLast(
  m => m.role === "assistant" && m.metadata?.sub_agent === "plan"
);
```

When Approve is clicked:
```text
onSend(`Execute this plan:\n${planContent}`, "agent");
setPlanDismissed(true);
```

### Enhanced Welcome Message

```text
<div className="flex flex-col items-center justify-center py-20">
  <div className="w-14 h-14 rounded-2xl bg-accent shadow-lg shadow-accent/20 
                  flex items-center justify-center mb-4">
    <span className="text-2xl font-bold text-white">A</span>
  </div>
  <h2 className="text-2xl font-bold text-foreground drop-shadow-sm mb-2">
    Hi! I'm AIKO
  </h2>
  <p className="text-base text-muted-foreground">
    Describe what you want to build and I'll help you create it.
  </p>
</div>
```

### PreviewPanel URL Bar

```text
<div className="flex items-center gap-2 px-4 py-2">
  <div className="flex-1 flex items-center gap-2 rounded-full bg-secondary/80 
                  border border-border/40 px-3 py-1.5 text-xs text-muted-foreground">
    <Monitor className="w-3.5 h-3.5" />
    <span>/project/{projectId || "?"}</span>
  </div>
  <button><ExternalLink className="w-3.5 h-3.5" /></button>
  <button><RefreshCw className="w-3.5 h-3.5" /></button>
</div>
```

---

## What Does NOT Change

- All hooks (`useChat`, `useProject`, `useSnapshots`) remain identical
- Database schema, RLS policies, edge functions -- untouched
- `FileTree`, `CodeViewer` internal logic -- unchanged
- Sandpack configuration and template system -- unchanged
- Version history dropdown -- stays in top bar
- 2-pane layout structure (Chat left, Right pane right) -- unchanged
- ModeToggle, AgentStatusIndicator -- unchanged from previous redesign
- All routing, auth, dashboard -- unchanged

