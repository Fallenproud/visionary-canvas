
# Playground Polish Plan — Status

## ✅ Completed

### Phase 1: Core UI Polish
- [x] ChatPanel: enlarged input bar (rounded-3xl, p-3, min-h-[44px])
- [x] ChatPanel: enhanced welcome message (text-2xl, drop-shadow, larger icon)
- [x] PreviewPanel: browser-style URL bar with Monitor/ExternalLink/RotateCw
- [x] PreviewPanel: enhanced phone frame (shadow-2xl, rounded-[2.5rem])
- [x] Playground.tsx: backdrop-blur-sm + shadow-sm top bar, bg-secondary/5 right pane

### Phase 2: PlanCard
- [x] PlanCard component with header, markdown body, Edit/Approve footer
- [x] ChatPanel integration: detect `sub_agent === "plan"` metadata
- [x] Approve triggers `onSend("Execute this plan:...", "agent")`
- [x] Dismiss/collapse functionality

### Phase 3: Animations, TaskCard, Explorer Wiring
- [x] PlanCard: framer-motion slide-in (spring) + AnimatePresence in ChatPanel
- [x] PlanCard: smooth expand/collapse with motion.div height animation
- [x] Welcome message: staggered entrance (scale-in icon, fade-up heading/text)
- [x] TaskCard component: "Files updated" checklist with clickable file links
- [x] ChatMessage: renders TaskCard when `files_changed` metadata exists
- [x] Explorer wiring: onFileClick switches right pane to explorer + selects file

---

## 🔮 Future Enhancements (Not Yet Started)

- [ ] Streaming plan content with skeleton loading state
- [ ] Plan version history / diff view
- [ ] TaskCard: show file diff preview on hover
- [ ] Real-time file change indicators in FileTree during agent execution
- [ ] Keyboard shortcuts for plan approve/dismiss
- [ ] Chat message reactions / feedback
