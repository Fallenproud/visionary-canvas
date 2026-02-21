

# Playground Refinement: Preview Pane, Chat UX, and AI Response Polish

This plan addresses five interconnected areas: fixing the preview pane to show only the app UI (no code), restructuring AI responses to be human-friendly and compact, hiding raw code blocks from chat, adding infinite scroll to the chat, and upgrading the boilerplate templates for proper HTML rendering.

---

## 1. Preview Pane: Show Only the App, No Code

**Problem:** Sandpack currently renders with its default layout which can show editor panels or code alongside the preview.

**Fix in `PreviewPanel.tsx`:**
- Switch Sandpack options to explicitly hide all editor UI by setting `showConsole: false`, `showConsoleButton: false`
- Add `layout: "preview"` to the Sandpack options -- this forces Sandpack into preview-only mode (no code editor visible at all)
- Remove `activeFile` option since we're not showing an editor
- The phone frame wrapper stays as-is (the rounded border, shadow, URL bar)

**File:** `src/components/playground/PreviewPanel.tsx`

---

## 2. Chat Messages: Hide Raw Code Blocks, Show Human-Friendly Summaries

**Problem:** When AIKO responds with code, the entire code block renders in the chat as giant `<pre>` blocks, consuming massive space and overwhelming non-technical users.

**Solution: Strip code blocks from rendered content and replace with a compact summary.**

### 2a. New utility: `formatAssistantContent` in `src/lib/chat-formatter.ts` (NEW FILE)

A function that processes assistant message content before rendering:
- **Strips code blocks** matching the pattern ` ```lang:filepath\n...code...\n``` ` from the displayed markdown
- **Replaces them** with a placeholder like `[File updated: filepath]` or removes them entirely (since TaskCard already shows file links)
- **Truncates long messages**: If the remaining text exceeds 600 characters, show a truncated version with a "Show more" toggle
- **Preserves** the raw content in the database (no data loss) -- formatting is purely at render time

### 2b. Update `ChatMessage.tsx`

- Import and use `formatAssistantContent` to process `message.content` before passing to `ReactMarkdown`
- Add a "Show more / Show less" toggle button for truncated messages
- Add `useState` for expanded state
- Move the TaskCard to render **outside** the message bubble with proper spacing/padding between it and the prose
- Add distinctive visual separation: the prose text gets a subtle bottom border when TaskCard follows

### 2c. Improve ChatMessage visual structure

- Add more padding between message groups (`mb-4` instead of `mb-3`)
- Assistant messages get a cleaner, card-like feel: `rounded-2xl` with softer background
- Remove the `AIKO` label from every message (it's redundant since only AIKO responds on the left) -- replace with a small avatar icon on the first message in a sequence only

**Files:** `src/lib/chat-formatter.ts` (new), `src/components/playground/ChatMessage.tsx`

---

## 3. Infinite Scroll: Remove the Visible Scrollbar

**Problem:** The chat pane shows a visible scrollbar (as seen in the reference image).

**Fix in `ChatPanel.tsx`:**
- Add CSS utility classes to hide the scrollbar while keeping scroll functionality: `scrollbar-hide` class using Tailwind's built-in `scrollbar-hide` or custom CSS
- Add a small CSS snippet in `src/index.css` for `.scrollbar-hide`:
  ```css
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  ```
- Apply `scrollbar-hide` to the messages scroll container

**Files:** `src/index.css`, `src/components/playground/ChatPanel.tsx`

---

## 4. AI Response Improvements: Humanized, Structured Output

**Problem:** AIKO's responses are too technical, showing raw code with minimal explanation. Non-technical users need friendlier interactions.

### 4a. Update the system prompt in the edge function (`supabase/functions/aiko-chat/index.ts`)

Add new instructions to the system prompt telling AIKO to:
- **Lead with a friendly summary** of what was done (1-2 sentences, no jargon)
- **Never dump full file contents** in explanations -- just mention what was changed and why
- **Use bullet points** for multi-step work (e.g., "Created the home screen", "Added navigation")
- **End with a conversational follow-up** question ("Would you like me to add..." or "What should we work on next?")
- **When in plan mode**: Structure the plan as numbered steps, not paragraphs of text
- **Code blocks** are still generated (for the backend to parse and save to files), but the AI should put them at the very end of the response, after the human-friendly summary, separated by a `---` divider -- this way the formatter can strip them cleanly

### 4b. The response format becomes:

```
[Friendly summary paragraph]

[Bullet points of what was done]

[Follow-up question]

---

```tsx:filepath
// code here (hidden from chat UI by the formatter)
```

```

**File:** `supabase/functions/aiko-chat/index.ts`

---

## 5. Boilerplate Templates: Proper HTML for Preview Rendering

**Problem:** The templates use React Native / `react-native-web` components but Sandpack may not render them properly without the right setup.

### 5a. Update `src/lib/templates.ts`

Rewrite the two templates to use proper **React web** components (since Sandpack renders in a web iframe):
- Replace `SafeAreaView`, `View`, `Text`, `TouchableOpacity` with `div`, `span`, `button`, `p`, `h1`
- Use inline styles or a simple CSS approach that works in Sandpack's React template
- Add proper HTML structure that renders a clean mobile-looking UI in the phone frame
- Keep the `App.tsx` entry point pattern
- Remove react-native and react-native-web dependencies from templates (not needed for web preview)
- Add a minimal `index.html` that references the React entry point if Sandpack requires it (Sandpack's `react` template handles this automatically, so likely not needed)

### 5b. Update `src/lib/sandpack-config.ts`

- Remove `SANDPACK_DEPENDENCIES` that reference `react-native` and `react-native-web`
- The `projectFilesToSandpackFiles` function stays as-is

### 5c. Update `PreviewPanel.tsx` customSetup

- Remove the `react-native-web` dependency from `customSetup.dependencies`
- The preview will now render clean web HTML in the phone frame

**Files:** `src/lib/templates.ts`, `src/lib/sandpack-config.ts`, `src/components/playground/PreviewPanel.tsx`

---

## 6. Edge Function Prompt Refinement

Update the AIKO system prompt to align with the web-based preview:
- Change references from "React Native / Expo" to "React web application"
- Update code style rules: use CSS/Tailwind instead of `StyleSheet.create()`
- Update the response format to use standard React components (`div`, `button`, etc.)
- Keep the same code block format (`tsx:filepath`) since the parser depends on it
- Sub-agent prompts updated accordingly (no more "React Native" references)

**File:** `supabase/functions/aiko-chat/index.ts`

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/chat-formatter.ts` | Create | Strip code blocks from display, truncate long messages |
| `src/components/playground/ChatMessage.tsx` | Modify | Use formatter, add show more/less, cleaner layout |
| `src/components/playground/ChatPanel.tsx` | Modify | Add scrollbar-hide class |
| `src/components/playground/PreviewPanel.tsx` | Modify | Force preview-only layout, remove react-native-web dep |
| `src/index.css` | Modify | Add scrollbar-hide CSS utility |
| `src/lib/templates.ts` | Modify | Rewrite templates to use React web components |
| `src/lib/sandpack-config.ts` | Modify | Remove react-native dependencies |
| `supabase/functions/aiko-chat/index.ts` | Modify | Humanized prompt, web-based code generation, structured responses |

---

## Technical Details

### chat-formatter.ts

```text
const CODE_BLOCK_PATTERN = /```\w+:[^\n]+\n[\s\S]*?```/g;
const DIVIDER_PATTERN = /\n---\n[\s\S]*$/;  // Strip everything after the --- divider

export function formatAssistantContent(raw: string): { display: string; isTruncated: boolean } {
  // 1. Remove the code-blocks section (after --- divider)
  let display = raw.replace(DIVIDER_PATTERN, "").trim();
  
  // 2. Also strip any inline code blocks with file paths
  display = display.replace(CODE_BLOCK_PATTERN, "").trim();
  
  // 3. Clean up excessive whitespace
  display = display.replace(/\n{3,}/g, "\n\n");
  
  // 4. Truncate if > 600 chars
  const isTruncated = display.length > 600;
  
  return { display, isTruncated };
}

export function truncateContent(text: string, maxLength = 600): string {
  if (text.length <= maxLength) return text;
  const cutoff = text.lastIndexOf("\n", maxLength);
  return text.slice(0, cutoff > 200 ? cutoff : maxLength) + "...";
}
```

### ChatMessage.tsx updated structure

```text
<div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
  <div className="max-w-[85%] space-y-2">
    {/* Message bubble */}
    <div className={`rounded-2xl px-4 py-3 text-sm ${
      isUser ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-foreground"
    }`}>
      <div className="prose prose-sm prose-invert max-w-none">
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      </div>
      {!isUser && isTruncated && (
        <button onClick={toggleExpand} className="text-xs text-primary mt-2">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
    
    {/* TaskCard outside the bubble */}
    {!isUser && filesChanged?.length > 0 && onFileClick && (
      <TaskCard files={filesChanged} onFileClick={onFileClick} />
    )}
  </div>
</div>
```

### PreviewPanel.tsx Sandpack options

```text
<Sandpack
  template="react"
  files={files}
  options={{
    showNavigator: false,
    showTabs: false,
    showLineNumbers: false,
    showConsole: false,
    showConsoleButton: false,
    layout: "preview",
    editorHeight: "100%",
    classes: {
      "sp-wrapper": "!h-full !rounded-none",
      "sp-preview-container": "!h-full",
      "sp-preview-iframe": "!h-full",
    },
  }}
  theme="dark"
/>
```

### Updated AIKO System Prompt (key additions)

```text
## Response Style
- Lead with a friendly 1-2 sentence summary of what you did
- Use bullet points for multi-step work
- Keep explanations non-technical -- focus on WHAT was achieved, not HOW
- End with a conversational follow-up question
- Place all code blocks AFTER a --- divider at the end of your response
- The user will NOT see the code blocks in chat -- they appear in the file explorer

## Code Generation
- Generate standard React web components (div, button, span, etc.)
- Use inline styles or CSS modules
- Do NOT use React Native components
```

### Updated Templates (blank example)

```text
"/App.tsx": `
export default function App() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: "#ffffff",
      padding: 20
    }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Welcome to My App
      </h1>
      <p style={{ fontSize: 16, color: "#666" }}>Built with AIKO</p>
    </div>
  );
}
`
```

---

## What Does NOT Change

- Database schema, RLS policies -- untouched
- `useChat.ts` hook logic (streaming, saving, applying code blocks) -- unchanged
- `code-parser.ts` -- unchanged (still parses code blocks server-side for file saving)
- FileTree, CodeViewer -- unchanged
- PlanCard component -- unchanged
- Playground.tsx layout -- unchanged
- Auth, routing, dashboard -- unchanged
- Snapshot system -- unchanged

