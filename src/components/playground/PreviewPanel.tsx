import { useState, useCallback, useEffect } from "react";
import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";
import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { Monitor, ExternalLink, RotateCw, Smartphone, Tablet, MonitorSmartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DeviceMode = "mobile" | "tablet" | "desktop";

interface DeviceConfig {
  width: string;
  height: string;
  borderRadius: string;
  label: string;
}

const DEVICE_CONFIGS: Record<DeviceMode, DeviceConfig> = {
  mobile: { width: "320px", height: "580px", borderRadius: "2.5rem", label: "Mobile" },
  tablet: { width: "768px", height: "580px", borderRadius: "1.5rem", label: "Tablet" },
  desktop: { width: "100%", height: "100%", borderRadius: "0.75rem", label: "Desktop" },
};

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
  const [device, setDevice] = useState<DeviceMode>("mobile");
  const [sandpackKey, setSandpackKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setSandpackKey((k) => k + 1);
  }, []);

  // Show loading briefly on mount and key change
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [sandpackKey]);

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

  const config = DEVICE_CONFIGS[device];
  const isDesktop = device === "desktop";

  return (
    <div className="h-full flex flex-col">
      {/* URL Bar + Device Switcher */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0">
        {/* Device toggle pills */}
        <div className="flex items-center gap-0.5 rounded-full bg-secondary/60 border border-border/30 p-0.5">
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-full transition-colors ${device === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`p-1.5 rounded-full transition-colors ${device === "tablet" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Tablet"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-full transition-colors ${device === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Desktop"
          >
            <MonitorSmartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 rounded-full bg-secondary/80 border border-border/40 px-3 py-1.5 text-xs text-muted-foreground">
          <Monitor className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">/project/{projectId || "?"}</span>
        </div>

        <button className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground" title="Open in new tab">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground"
          title="Refresh preview"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Device Frame */}
      <div className="flex-1 overflow-hidden">
        <div className={`h-full flex items-center justify-center bg-secondary/10 ${isDesktop ? "p-2" : "p-6"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={device}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden border-2 border-border/50 shadow-2xl shadow-black/20 bg-white ring-1 ring-border/20 relative flex flex-col"
              style={{
                width: config.width,
                height: config.height,
                borderRadius: config.borderRadius,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              {/* Dynamic Island / Notch — mobile only */}
              {device === "mobile" && (
                <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pointer-events-none pt-2">
                  <div className="w-[90px] h-[22px] bg-black rounded-full shadow-inner flex items-center justify-end pr-1.5 gap-1">
                    <div className="w-[6px] h-[6px] rounded-full bg-muted-foreground/30" />
                  </div>
                </div>
              )}

              {/* Home indicator — mobile only */}
              {device === "mobile" && (
                <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pointer-events-none pb-2">
                  <div className="w-[100px] h-[4px] bg-black/30 rounded-full" />
                </div>
              )}

              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 z-10 bg-background/90 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-muted-foreground">Bundling...</span>
                </div>
              )}

              <div className="flex-1 min-h-0">
                <SandpackProvider
                  key={sandpackKey}
                  template="react-ts"
                  files={filesWithReset}
                  customSetup={{
                    dependencies: {
                      react: "^18.2.0",
                      "react-dom": "^18.2.0",
                    },
                  }}
                  theme="dark"
                >
                  <SandpackPreview
                    showNavigator={false}
                    showOpenInCodeSandbox={false}
                    showRefreshButton={false}
                    style={{ height: "100%", width: "100%" }}
                  />
                </SandpackProvider>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
