

# Fix Desktop Preview: Fill Entire Pane

## Problem
In desktop mode, the Sandpack preview frame does not stretch to fill the full width of the right pane. The `motion.div` uses `flex-1 min-h-0` which handles vertical stretching, but has no horizontal width directive, so it collapses to the content's intrinsic width.

## Root Cause
Line 233 in `PreviewPanel.tsx`: the desktop branch adds `flex-1 min-h-0` for height but never adds `w-full` for width. Mobile/tablet work fine because they use fixed `width` values in the `style` prop.

## Fix (single file, single line change)
**File: `src/components/playground/PreviewPanel.tsx`**

On line 233, change:
```
className={`overflow-hidden bg-white relative flex flex-col border-2 border-border/50 shadow-2xl shadow-black/20 ring-1 ring-border/20 ${isDesktop ? "flex-1 min-h-0" : ""}`}
```
to:
```
className={`overflow-hidden bg-white relative flex flex-col border-2 border-border/50 shadow-2xl shadow-black/20 ring-1 ring-border/20 ${isDesktop ? "flex-1 min-h-0 w-full" : ""}`}
```

This adds `w-full` so the desktop frame stretches horizontally to match the pane width (minus the `p-3` padding), while keeping the rounded border, shadow, and ring intact.

## What stays untouched
- Mobile and tablet modes (unchanged)
- Console panel, device switcher, URL bar, all other components
- No other files are modified

