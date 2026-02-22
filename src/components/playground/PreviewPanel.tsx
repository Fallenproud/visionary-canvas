import { useState, useCallback, useEffect, useMemo } from "react";
import { SandpackProvider, SandpackPreview, useSandpackConsole } from "@codesandbox/sandpack-react";
import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { Monitor, ExternalLink, RotateCw, Smartphone, Tablet, MonitorSmartphone, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function StatusBarClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const formatted = time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return <span>{formatted}</span>;
}

function DeviceStatusBar({ isTablet = false }: { isTablet?: boolean }) {
  const textSize = isTablet ? "text-[11px]" : "text-[9px]";
  const px = isTablet ? "px-6" : "px-5";
  const iconScale = isTablet ? 1.2 : 1;
  return (
    <div className={`flex items-center justify-between ${px} pt-1.5 ${textSize} font-semibold text-black/70`}>
      <StatusBarClock />
      {!isTablet && <div className="w-[90px]" />}
      {isTablet && <div className="flex-1" />}
      <div className="flex items-center gap-1.5">
        <svg width={14 * iconScale} height={10 * iconScale} viewBox="0 0 14 10" fill="currentColor" className="opacity-70">
          <rect x="0" y="7" width="2.5" height="3" rx="0.5" />
          <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" />
          <rect x="7" y="2.5" width="2.5" height="7.5" rx="0.5" />
          <rect x="10.5" y="0" width="2.5" height="10" rx="0.5" />
        </svg>
        <svg width={12 * iconScale} height={10 * iconScale} viewBox="0 0 12 10" fill="currentColor" className="opacity-70">
          <path d="M6 8.5a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM2.8 6.6a4.4 4.4 0 016.4 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M.8 4.2a7.2 7.2 0 0110.4 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <div className="flex items-center gap-px">
          <div className={`${isTablet ? "w-[22px] h-[11px]" : "w-[18px] h-[9px]"} border border-current rounded-[2px] p-[1.5px] opacity-70`}>
            <div className="h-full w-[75%] bg-current rounded-[1px]" />
          </div>
          <div className={`w-[1.5px] ${isTablet ? "h-[5px]" : "h-[4px]"} bg-current rounded-r-full opacity-70`} />
        </div>
      </div>
    </div>
  );
}

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

/** Console panel that displays Sandpack console logs */
const ConsolePanel = () => {
  const { logs, reset } = useSandpackConsole({ resetOnPreviewRestart: true });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1 border-b border-border/30">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Console</span>
        <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-auto font-mono text-[11px] p-2 space-y-0.5">
        {logs.length === 0 && (
          <p className="text-muted-foreground/50 text-center py-4">No console output</p>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            className={`px-2 py-0.5 rounded ${
              log.method === "error" || log.method === "warn"
                ? log.method === "error"
                  ? "text-red-400 bg-red-500/5"
                  : "text-yellow-400 bg-yellow-500/5"
                : "text-muted-foreground"
            }`}
          >
            {log.data?.map((d: any) => (typeof d === "object" ? JSON.stringify(d) : String(d))).join(" ")}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PreviewPanel = ({ files, projectId }: PreviewPanelProps) => {
  const [device, setDevice] = useState<DeviceMode>("mobile");
  const [sandpackKey, setSandpackKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setSandpackKey((k) => k + 1);
  }, []);

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

  const filesWithReset: SandpackFiles = { ...files };
  if (!filesWithReset["/styles.css"]) {
    filesWithReset["/styles.css"] = { code: GLOBAL_RESET_CSS };
  }

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

        <div className="flex-1 flex items-center gap-2 rounded-full bg-secondary/80 border border-border/40 px-3 py-1.5 text-xs text-muted-foreground">
          <Monitor className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">/project/{projectId || "?"}</span>
        </div>

        <button
          onClick={() => setConsoleOpen((v) => !v)}
          className={`p-1.5 rounded-md transition-colors ${consoleOpen ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary/80"}`}
          title="Toggle console"
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>
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

      {/* Device Frame + Console */}
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
        <div className={`flex-1 overflow-hidden flex flex-col ${consoleOpen ? "" : ""}`}>
          <div className={`${consoleOpen ? "flex-1 min-h-0" : "flex-1"} overflow-hidden`}>
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
                  {device === "mobile" && (
                    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                      <DeviceStatusBar />
                      <div className="flex justify-center pt-0.5">
                        <div className="w-[90px] h-[22px] bg-black rounded-full shadow-inner flex items-center px-2.5 gap-1.5">
                          <div className="w-[7px] h-[7px] rounded-full bg-[#1a1a2e] ring-1 ring-white/10" />
                          <div className="flex-1" />
                          <div className="w-[5px] h-[5px] rounded-full bg-muted-foreground/30" />
                        </div>
                      </div>
                    </div>
                  )}

                  {device === "tablet" && (
                    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                      <DeviceStatusBar isTablet />
                      <div className="flex justify-center -mt-[14px]">
                        <div className="w-[6px] h-[6px] rounded-full bg-black/20 ring-1 ring-black/10" />
                      </div>
                    </div>
                  )}

                  {(device === "mobile" || device === "tablet") && (
                    <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pointer-events-none pb-2">
                      <div className={`${device === "tablet" ? "w-[140px]" : "w-[100px]"} h-[4px] bg-black/30 rounded-full`} />
                    </div>
                  )}

                  {loading && (
                    <div className="absolute inset-0 z-10 bg-background/90 flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-muted-foreground">Bundling...</span>
                    </div>
                  )}

                  <div className="flex-1 min-h-0">
                    <SandpackPreview
                      showNavigator={false}
                      showOpenInCodeSandbox={false}
                      showRefreshButton={false}
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Collapsible console */}
          <AnimatePresence>
            {consoleOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 160 }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/40 bg-card/80 overflow-hidden"
              >
                <ConsolePanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SandpackProvider>
    </div>
  );
};
