

# Fix Sandpack Preview: Proper Integration, Dependencies, and Full Iframe Rendering

## Root Cause

The error `Could not find dependency: 'react-dom' relative to '/node_modules/react-native-web/...'` happens because **previously saved project files** in the database still contain `import { StatusBar } from 'react-native'` and other React Native imports from earlier AI sessions. The current templates are correct (standard React web), but the DB-stored files from past conversations are stale.

Additionally, the Sandpack component is missing a `customSetup` prop to explicitly declare dependencies, and lacks proper CSS overrides to fill the phone frame completely.

## What Changes

### 1. PreviewPanel.tsx -- Add customSetup and fix iframe sizing

- Add `customSetup={{ dependencies: { react: "^18.2.0", "react-dom": "^18.2.0" } }}` to explicitly provide react/react-dom
- Remove `react-native-web` from any lingering references
- Add global CSS overrides via a hidden `/styles.css` file injected into Sandpack to ensure `html, body, #root` fill 100% height with no margins
- Fix the Sandpack wrapper CSS: the current `!h-full` classes don't fully propagate because Sandpack's internal layout needs the wrapper to have explicit height -- switch to a container div with `style={{ height: "100%", width: "100%" }}`

**No index.tsx needed** -- Sandpack's built-in `react` template automatically creates an entry point that imports and renders `App.tsx`. This is the correct architecture.

### 2. sandpack-config.ts -- Inject global reset styles

Update `projectFilesToSandpackFiles` to automatically inject a `/public/index.html` override or a global CSS reset file that ensures full-bleed rendering inside the iframe. This prevents the white-space gaps and scrollbar issues.

Add a helper that merges a base CSS reset into the files:

```
/styles.css -> body { margin: 0; padding: 0; min-height: 100vh; }
```

### 3. templates.ts -- Add global styles file to boilerplates

Both the blank and tabs templates should include:
- A `/styles.css` file with `html, body, #root { margin: 0; padding: 0; min-height: 100vh; width: 100%; }` and `* { box-sizing: border-box; }`
- Import this in `App.tsx` via `import "./styles.css"`
- This ensures the preview fills the phone frame with no gaps

### 4. Edge function prompt -- Enforce styles.css import

Update the AIKO system prompt to instruct the AI to always include `import "./styles.css"` in App.tsx and to generate the styles.css file with the base reset when scaffolding a new app.

### 5. No terminal in preview

The Sandpack console/terminal is already hidden (`showConsole: false`). There is no terminal component to move to the explorer -- the console output simply does not render.

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/playground/PreviewPanel.tsx` | Modify | Add customSetup with dependencies, fix height propagation, inject reset CSS |
| `src/lib/sandpack-config.ts` | Modify | Auto-inject global CSS reset into Sandpack files |
| `src/lib/templates.ts` | Modify | Add styles.css to both templates, import in App.tsx |
| `supabase/functions/aiko-chat/index.ts` | Modify | Add instruction to always include styles.css with CSS reset |

---

## Technical Details

### PreviewPanel.tsx

```text
<Sandpack
  template="react-ts"
  files={filesWithReset}
  customSetup={{
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
    },
  }}
  options={{
    showNavigator: false,
    showTabs: false,
    showLineNumbers: false,
    showConsole: false,
    showConsoleButton: false,
    layout: "preview",
  }}
  theme="dark"
/>
```

Key changes:
- Switch template from `"react"` to `"react-ts"` for TypeScript support (matches .tsx files)
- Add `customSetup.dependencies` to explicitly provide react and react-dom
- Wrap Sandpack in a div with `style={{ height: "100%", width: "100%" }}` instead of relying on CSS class overrides
- Inject a `/styles.css` reset file into the files prop if not already present

### sandpack-config.ts

```text
const GLOBAL_RESET_CSS = `html, body, #root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
* { box-sizing: border-box; }`;

export function projectFilesToSandpackFiles(
  files: Array<{ file_path: string; content: string }>
): SandpackFiles {
  const sandpackFiles: SandpackFiles = {};
  for (const file of files) {
    const path = file.file_path.startsWith("/") ? file.file_path : `/${file.file_path}`;
    sandpackFiles[path] = { code: file.content };
  }
  // Always ensure a global CSS reset exists
  if (!sandpackFiles["/styles.css"]) {
    sandpackFiles["/styles.css"] = { code: GLOBAL_RESET_CSS };
  }
  return sandpackFiles;
}
```

### templates.ts changes

Both templates get:
1. A `/styles.css` file with the global reset
2. `import "./styles.css";` added as the first line of `/App.tsx`
3. Remove the `/package.json` file from templates -- Sandpack's `customSetup.dependencies` handles this, and having a conflicting package.json can cause resolution errors

### Edge function prompt addition

Add to the Code Generation Rules section:
```text
- Always include a /styles.css file with a CSS reset (margin: 0, padding: 0, min-height: 100vh on html/body/#root)
- Always import "./styles.css" at the top of App.tsx
- The entry point is always App.tsx -- Sandpack handles the index automatically
- Do NOT create index.tsx or index.html -- they are managed by the preview system
```

---

## What Does NOT Change

- useChat.ts, code-parser.ts -- unchanged
- FileTree, CodeViewer -- unchanged
- ChatPanel, ChatMessage, PlanCard, TaskCard -- unchanged
- Database schema -- unchanged
- Playground.tsx layout -- unchanged

