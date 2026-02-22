import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

interface FileDiffViewerProps {
  filePath: string;
  beforeContent: string;
  afterContent: string;
  onClose: () => void;
}

export const FileDiffViewer = ({ filePath, beforeContent, afterContent, onClose }: FileDiffViewerProps) => {
  const [view, setView] = useState<"split" | "unified">("split");

  const beforeLines = beforeContent.split("\n");
  const afterLines = afterContent.split("\n");

  // Simple line-level diff: mark added, removed, unchanged
  const maxLen = Math.max(beforeLines.length, afterLines.length);
  const diffLines: Array<{ type: "added" | "removed" | "unchanged"; before?: string; after?: string; lineNo: number }> = [];

  for (let i = 0; i < maxLen; i++) {
    const b = beforeLines[i];
    const a = afterLines[i];
    if (b === undefined) {
      diffLines.push({ type: "added", after: a, lineNo: i + 1 });
    } else if (a === undefined) {
      diffLines.push({ type: "removed", before: b, lineNo: i + 1 });
    } else if (b !== a) {
      diffLines.push({ type: "removed", before: b, lineNo: i + 1 });
      diffLines.push({ type: "added", after: a, lineNo: i + 1 });
    } else {
      diffLines.push({ type: "unchanged", before: b, after: a, lineNo: i + 1 });
    }
  }

  const added = diffLines.filter((d) => d.type === "added").length;
  const removed = diffLines.filter((d) => d.type === "removed").length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="absolute inset-0 z-30 bg-background/98 backdrop-blur-sm flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-card/60 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground">DIFF</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-xs font-medium text-foreground truncate">{filePath}</span>
            <span className="text-[10px] text-green-400 font-medium">+{added}</span>
            <span className="text-[10px] text-red-400 font-medium">-{removed}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-md border border-border/40 overflow-hidden">
              <button
                onClick={() => setView("split")}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${view === "split" ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Split
              </button>
              <button
                onClick={() => setView("unified")}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${view === "unified" ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Unified
              </button>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Diff content */}
        <div className="flex-1 overflow-auto text-xs font-mono">
          {beforeContent === "" && afterContent !== "" ? (
            <div className="p-4 text-center text-muted-foreground text-xs">
              <span className="text-green-400 font-medium">New file</span> — entire content was added
            </div>
          ) : view === "split" ? (
            <div className="flex h-full">
              {/* Before */}
              <div className="flex-1 border-r border-border/30 overflow-auto">
                <div className="px-1 py-0.5 text-[10px] font-semibold text-muted-foreground bg-secondary/40 sticky top-0 border-b border-border/20 pl-3">
                  BEFORE
                </div>
                {diffLines.map((line, i) => {
                  if (line.type === "added") return null;
                  return (
                    <div
                      key={`b-${i}`}
                      className={`flex ${line.type === "removed" ? "bg-red-500/10" : ""}`}
                    >
                      <span className="w-8 text-right pr-2 text-muted-foreground/40 select-none shrink-0">{line.lineNo}</span>
                      <span className={`flex-1 pr-2 whitespace-pre ${line.type === "removed" ? "text-red-400" : "text-muted-foreground"}`}>
                        {line.type === "removed" ? `- ${line.before}` : line.before}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* After */}
              <div className="flex-1 overflow-auto">
                <div className="px-1 py-0.5 text-[10px] font-semibold text-muted-foreground bg-secondary/40 sticky top-0 border-b border-border/20 pl-3">
                  AFTER
                </div>
                {diffLines.map((line, i) => {
                  if (line.type === "removed") return null;
                  return (
                    <div
                      key={`a-${i}`}
                      className={`flex ${line.type === "added" ? "bg-green-500/10" : ""}`}
                    >
                      <span className="w-8 text-right pr-2 text-muted-foreground/40 select-none shrink-0">{line.lineNo}</span>
                      <span className={`flex-1 pr-2 whitespace-pre ${line.type === "added" ? "text-green-400" : "text-muted-foreground"}`}>
                        {line.type === "added" ? `+ ${line.after}` : line.after}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Unified view */
            <div className="overflow-auto">
              {diffLines.map((line, i) => (
                <div
                  key={`u-${i}`}
                  className={`flex ${line.type === "added" ? "bg-green-500/10" : line.type === "removed" ? "bg-red-500/10" : ""}`}
                >
                  <span className="w-8 text-right pr-2 text-muted-foreground/40 select-none shrink-0">{line.lineNo}</span>
                  <span className={`flex-1 pr-2 whitespace-pre ${
                    line.type === "added" ? "text-green-400" : line.type === "removed" ? "text-red-400" : "text-muted-foreground"
                  }`}>
                    {line.type === "added" ? `+ ${line.after}` : line.type === "removed" ? `- ${line.before}` : line.before}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
