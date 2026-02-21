import { Sandpack } from "@codesandbox/sandpack-react";
import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { Monitor, ExternalLink, RotateCw } from "lucide-react";

interface PreviewPanelProps {
  files: SandpackFiles;
  projectId?: string;
}

export const PreviewPanel = ({ files, projectId }: PreviewPanelProps) => {
  if (Object.keys(files).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No files to preview yet
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* URL Bar */}
      <div className="flex items-center gap-2 px-6 py-2 shrink-0">
        <div className="flex-1 flex items-center gap-2 rounded-full bg-secondary/80 border border-border/40 px-3 py-1.5 text-xs text-muted-foreground">
          <Monitor className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">/project/{projectId || "?"}</span>
        </div>
        <button className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground">
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Phone Frame */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center p-6 bg-secondary/10">
          <div className="w-[320px] h-[580px] rounded-[2.5rem] border-2 border-border/50 overflow-hidden shadow-2xl shadow-black/20 bg-white ring-1 ring-border/20">
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
          </div>
        </div>
      </div>
    </div>
  );
};
