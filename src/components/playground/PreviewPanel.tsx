import { Sandpack } from "@codesandbox/sandpack-react";
import type { SandpackFiles } from "@codesandbox/sandpack-react";

interface PreviewPanelProps {
  files: SandpackFiles;
}

export const PreviewPanel = ({ files }: PreviewPanelProps) => {
  if (Object.keys(files).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No files to preview yet
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center p-6 bg-secondary/20">
          <div className="w-[320px] h-[580px] rounded-[2rem] border-2 border-border/60 overflow-hidden shadow-xl bg-white">
            <Sandpack
              template="react"
              files={files}
              options={{
                showNavigator: false,
                showTabs: false,
                showLineNumbers: false,
                editorHeight: "100%",
                classes: {
                  "sp-wrapper": "!h-full !rounded-none",
                  "sp-preview-container": "!h-full",
                  "sp-preview-iframe": "!h-full",
                },
                activeFile: "/App.tsx",
              }}
              theme="dark"
              customSetup={{
                dependencies: {
                  "react-native-web": "^0.19.0",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
