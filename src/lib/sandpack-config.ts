import type { SandpackFiles } from "@codesandbox/sandpack-react";

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

export const SANDPACK_DEPENDENCIES = {
  react: "^18.2.0",
  "react-dom": "^18.2.0",
};
