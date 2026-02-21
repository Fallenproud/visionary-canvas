

# Playground Enhancement: Animations, TaskCard, and Explorer Wiring

## What Changes

Three major enhancements to the Playground chat experience:

1. **Framer Motion animations** on PlanCard (slide-in) and welcome message (fade-in with stagger)
2. **TaskCard component** -- when AIKO writes code blocks, they appear as a checklist of files changed (not raw code) in the chat, with clickable file links that switch to Explorer and select that file
3. **Explorer wiring** -- ChatPanel gets callbacks to switch the right pane to Explorer and select a specific file, connecting AI output to the file tree

---

## 1. PlanCard Animations (framer-motion)

Replace the CSS `animate-in slide-in-from-bottom-4` with framer-motion for smoother, more delightful animations:

- Wrap the PlanCard outer div in `motion.div` with `initial={{ opacity: 0, y: 40 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, y: 20 }}`
- Use `AnimatePresence` in ChatPanel around the PlanCard render so it animates on mount/unmount
- The collapsible body uses `motion.div` with `animate={{ height: "auto" }}` / `initial={{ height: 0 }}` for smooth expand/collapse

**File:** `src/components/playground/PlanCard.tsx`

---

## 2. Welcome Message Animation (framer-motion)

Add a staggered entrance animation to the empty-state welcome:

- Wrap the welcome container in `motion.div` with a staggered children animation
- Icon scales in first, then heading fades up, then subtitle fades up
- Uses `variants` with `staggerChildren: 0.15`

**File:** `src/components/playground/ChatPanel.tsx`

---

## 3. TaskCard Component (New)

When an assistant message contains `files_changed` metadata (or code blocks are parsed from the content), instead of showing raw code in the chat bubble, display a **TaskCard** -- a compact checklist card showing each file as a clickable bullet point.

**Visual spec:**
- Small card with a header: "Files updated" with a file count badge
- Each file is a row with a checkbox icon (checked), the file path, and a clickable link icon
- Clicking a file path calls `onFileClick(filePath)` which switches the right pane to Explorer and selects that file
- Uses `motion.div` for a subtle slide-in entrance

**Props:**
```text
interface TaskCardProps {
  files: string[];
  onFileClick: (filePath: string) => void;
}
```

**File:** `src/components/playground/TaskCard.tsx` (new)

---

## 4. ChatMessage Enhancement

Update `ChatMessage` to detect when a message has `files_changed` in metadata and render a `TaskCard` below the message content instead of (or in addition to) the raw markdown.

- If `message.metadata?.files_changed?.length > 0`, render `<TaskCard>` after the prose content
- Pass `onFileClick` prop down from ChatPanel

**File:** `src/components/playground/ChatMessage.tsx`

---

## 5. Explorer Wiring (ChatPanel to Playground)

Add callback props to ChatPanel so clicking a file in TaskCard switches the right pane and selects the file:

- `ChatPanel` receives new prop: `onFileClick: (filePath: string) => void`
- `ChatMessage` receives the same prop and passes it to `TaskCard`
- In `Playground.tsx`, the `onFileClick` handler:
  1. Sets `rightPane` to `"explorer"`
  2. Sets `selectedFile` to the clicked file path

**Files:** `src/components/playground/ChatPanel.tsx`, `src/pages/Playground.tsx`

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/playground/TaskCard.tsx` | Create | Checklist card showing changed files as clickable links |
| `src/components/playground/PlanCard.tsx` | Modify | Add framer-motion slide-in/collapse animations |
| `src/components/playground/ChatPanel.tsx` | Modify | Add AnimatePresence for PlanCard, welcome animation, pass onFileClick through |
| `src/components/playground/ChatMessage.tsx` | Modify | Render TaskCard when files_changed metadata exists |
| `src/pages/Playground.tsx` | Modify | Wire onFileClick to switch pane and select file |

---

## Technical Details

### TaskCard.tsx Structure

```text
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="mt-2 rounded-lg border border-border/40 bg-background/50 overflow-hidden"
>
  <div className="px-3 py-2 flex items-center gap-2 border-b border-border/30">
    <CheckSquare className="w-3.5 h-3.5 text-green-400" />
    <span className="text-xs font-semibold">Files updated</span>
    <span className="text-[10px] bg-green-400/10 text-green-400 rounded px-1.5 py-0.5">
      {files.length}
    </span>
  </div>
  <div className="py-1">
    {files.map(file => (
      <button
        key={file}
        onClick={() => onFileClick(file)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs 
                   hover:bg-secondary/60 transition-colors group"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
        <span className="text-muted-foreground group-hover:text-foreground truncate">
          {file}
        </span>
        <ExternalLink className="w-3 h-3 text-muted-foreground/50 
                                 group-hover:text-foreground ml-auto shrink-0" />
      </button>
    ))}
  </div>
</motion.div>
```

### PlanCard Animation

```text
<AnimatePresence>  // in ChatPanel
  {latestPlan && (
    <motion.div
      key="plan-card"
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <PlanCard ... />
    </motion.div>
  )}
</AnimatePresence>
```

The expand/collapse body inside PlanCard uses:

```text
<AnimatePresence initial={false}>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {/* body + footer */}
    </motion.div>
  )}
</AnimatePresence>
```

### Welcome Message Animation

```text
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
  }}
  className="flex flex-col items-center justify-center py-20"
>
  <motion.div variants={{ hidden: { scale: 0.5, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}>
    {/* AIKO icon */}
  </motion.div>
  <motion.h2 variants={{ hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
    Hi! I'm AIKO
  </motion.h2>
  <motion.p variants={{ hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
    Describe what you want...
  </motion.p>
</motion.div>
```

### Playground.tsx onFileClick Handler

```text
const handleFileClick = (filePath: string) => {
  setRightPane("explorer");
  // Normalize path to match FileTree format
  setSelectedFile(filePath.startsWith("/") ? filePath : `/${filePath}`);
};

// Pass to ChatPanel:
<ChatPanel
  messages={messages}
  status={status}
  isLoading={isLoading}
  onSend={handleSend}
  onFileClick={handleFileClick}
/>
```

### ChatMessage Integration

```text
// In ChatMessage component:
{!isUser && message.metadata?.files_changed?.length > 0 && (
  <TaskCard
    files={message.metadata.files_changed}
    onFileClick={onFileClick}
  />
)}
```

---

## What Does NOT Change

- All hooks (useChat, useProject, useSnapshots) remain identical
- Database schema, edge functions -- untouched
- FileTree, CodeViewer internal logic -- unchanged
- PlanCard functionality (Edit/Approve) -- unchanged, only animation added
- ModeToggle, AgentStatusIndicator -- unchanged
- 2-pane layout structure -- unchanged
- Routing, auth, dashboard -- unchanged

