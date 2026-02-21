import type { SandpackFiles } from "@codesandbox/sandpack-react";

export function projectFilesToSandpackFiles(
  files: Array<{ file_path: string; content: string }>
): SandpackFiles {
  const sandpackFiles: SandpackFiles = {};
  for (const file of files) {
    const path = file.file_path.startsWith("/") ? file.file_path : `/${file.file_path}`;
    sandpackFiles[path] = { code: file.content };
  }
  return sandpackFiles;
}

export const SANDPACK_DEPENDENCIES = {
  react: "^18.2.0",
  "react-dom": "^18.2.0",
  "react-native": "^0.72.0",
  "react-native-web": "^0.19.0",
};
