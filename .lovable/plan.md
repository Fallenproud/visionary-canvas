

# Playground UI Redesign: 2-Pane Layout with ChatGPT-Inspired Chat

## What Changes

The current 4-panel layout (FileTree | CodeViewer | Preview | Chat) becomes a clean **2-pane layout**: **Chat on the left**, **Preview/Explorer on the right** -- with a toggle to switch the right pane between Preview and File Explorer views.

---

## New Layout

```text
+---------------------------+-----------------------------------+
|                           |                                   |
|   AIKO Chat               |   Right Pane (toggle between):    |
|   (always visible)        |                                   |
|                           |   [Preview]  or  [Explorer]       |
|   - Messages              |                                   |
|   - Status indicators     |   Preview: phone-frame Sandpack   |
|   - ChatGPT-style input   |   Explorer: FileTree + CodeViewer |
|     with Plan/Agent       |                                   |
|     button inline         |   Toggle pill centered on top     |
|                           |   border of right pane            |
+---------------------------+-----------------------------------+
|  [Plan|Agent] [input...........................] [Send]       |
+--------------------------------------------------------------+
```

---

## Changes Summary

### 1. Playground.tsx -- Simplify to 2 Panels

**Current:** 4 `ResizablePanel`s (FileTree, CodeViewer, Preview, Chat)
**New:** 2 `ResizablePanel`s (Chat left ~40%, Right pane ~60%)

- Add a `rightPane` state: `"preview" | "explorer"`
- Left panel renders `ChatPanel`
- Right panel renders either `PreviewPanel` or a combined `FileTree + CodeViewer` based on toggle
- A pill-style toggle button sits centered on the top border of the right pane
- No functionality changes -- same props, same hooks, same data flow

### 2. ChatPanel.tsx -- ChatGPT-Inspired Redesign

**Input area redesign:**
- Replace the current flat input + separate ModeToggle with a single unified input bar
- Rounded container with soft borders (like ChatGPT's input box)
- Plan/Agent toggle becomes a small segmented button **inside** the input bar, to the left of the text input
- Send button with arrow-up icon (ChatGPT style) on the right, only visible when input has text
- Textarea instead of input for multi-line support, auto-grows up to ~4 lines

**Status indicator redesign:**
- Move status indicator inline above the input bar (like ChatGPT's "thinking" indicator)
- Subtle animated dots or shimmer instead of the current pill

**Header:**
- Remove the separate ModeToggle from the header (moved to input bar)
- Keep AIKO branding in header

### 3. Right Pane Toggle Component (new)

A simple toggle pill that sits on the top border of the right pane:
- Two options: "Preview" and "Explorer"
- Rounded pill with soft transitions
- When "Preview" is selected: shows Sandpack in phone frame with rounded corners
- When "Explorer" is selected: shows FileTree on the left third + CodeViewer on the right two-thirds (using a simple flex layout, not resizable panels)

### 4. PreviewPanel.tsx -- Soft Rounded Frame

- Change the phone frame from hard `border-4` to softer `rounded-2xl` with subtle shadow
- Add padding and a slightly elevated surface background
- The Sandpack iframe gets `rounded-xl overflow-hidden` for soft corners

### 5. ModeToggle.tsx -- Compact Inline Version

- Shrink to a compact pill that fits inside the input bar
- Smaller text, tighter padding
- Same functionality (plan vs agent toggle)

---

## Files Modified

| File | Change |
|------|--------|
| `src/pages/Playground.tsx` | Replace 4-panel layout with 2-panel + right-pane toggle state |
| `src/components/playground/ChatPanel.tsx` | ChatGPT-inspired input bar with inline Plan/Agent toggle |
| `src/components/playground/ModeToggle.tsx` | Make compact for inline input bar use |
| `src/components/playground/PreviewPanel.tsx` | Softer rounded borders on phone frame |
| `src/components/playground/AgentStatusIndicator.tsx` | Subtler inline style for status |

## Files Created

| File | Purpose |
|------|---------|
| `src/components/playground/RightPaneToggle.tsx` | Toggle pill button for Preview vs Explorer |

---

## Technical Details

### Playground.tsx Structure

```text
<div h-screen flex-col>
  <TopBar /> (unchanged)
  <ResizablePanelGroup horizontal>
    <ResizablePanel 40%>   // Chat
      <ChatPanel ... />
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel 60%>   // Right pane
      <div relative h-full>
        <RightPaneToggle value={rightPane} onChange={setRightPane} />
        {rightPane === "preview" ? (
          <PreviewPanel files={sandpackFiles} />
        ) : (
          <div flex h-full>
            <div w-1/3 border-r>
              <FileTree ... />
            </div>
            <div flex-1>
              <CodeViewer ... />
            </div>
          </div>
        )}
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</div>
```

### ChatPanel Input Bar Structure

```text
<div rounded-2xl border bg-secondary/50 p-1 flex items-end>
  <ModeToggle />              // compact pill on the left
  <textarea auto-grow />      // grows up to 4 lines
  <button send />             // circular, only when has text
</div>
```

### RightPaneToggle

```text
<div absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10>
  <div rounded-full bg-background border shadow-sm flex p-0.5>
    <button "Preview" />
    <button "Explorer" />
  </div>
</div>
```

---

## What Does NOT Change

- All hooks (`useChat`, `useProject`, `useSnapshots`, etc.) remain identical
- Database schema, RLS policies, edge functions -- untouched
- `FileTree`, `CodeViewer` internal logic -- unchanged
- Sandpack configuration and template system -- unchanged
- Version history dropdown -- stays in top bar
- All routing, auth, dashboard -- unchanged

