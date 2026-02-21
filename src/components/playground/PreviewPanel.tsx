import { Sandpack } from "@codesandbox/sandpack-react";
import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { Monitor, ExternalLink, RotateCw } from "lucide-react";

interface PreviewPanelProps {
  files: SandpackFiles;
  projectId?: string;
}

const GLOBAL_RESET_CSS = `html, body, #root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
* { box-sizing: border-box; }`;

export const PreviewPanel = ({ files, projectId }: PreviewPanelProps) => {
  if (Object.keys(files).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No files to preview yet
      </div>
    );
  }

  // Inject global reset CSS if not already present
  const filesWithReset: SandpackFiles = { ...files };
  if (!filesWithReset["/styles.css"]) {
    filesWithReset["/styles.css"] = { code: GLOBAL_RESET_CSS };
  }

  // Ensure App.tsx imports styles.css
  const appFile = filesWithReset["/App.tsx"];
  if (appFile) {
    const code = typeof appFile === "string" ? appFile : appFile.code;
    if (!code.includes('import "./styles.css"')) {
      const updatedCode = `import "./styles.css";\n${code}`;
      filesWithReset["/App.tsx"] = { code: updatedCode };
    }
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
            <div style={{ height: "100%", width: "100%" }}>
              <Sandpack
                template="react-ts"
                files={filesWithReset}
                customSetup={{
                  dependencies: {
                    react: "^18.2.0",
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
                  classes: {
                    "sp-wrapper": "!h-full !rounded-none !border-none",
                    "sp-layout": "!h-full !border-none",
                    "sp-preview-container": "!h-full",
                    "sp-preview-iframe": "!h-full !w-full",
                  },
                }}
                theme="dark"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
