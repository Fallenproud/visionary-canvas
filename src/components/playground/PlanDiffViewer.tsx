import { CheckCircle2, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExecutionSummary {
  planned_files: string[];
  actual_files: string[];
  added: string[];
  skipped: string[];
}

interface PlanDiffViewerProps {
  summary: ExecutionSummary;
}

export const PlanDiffViewer = ({ summary }: PlanDiffViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const completed = summary.planned_files.filter((f) =>
    summary.actual_files.includes(f)
  );
  const extra = summary.actual_files.filter(
    (f) => !summary.planned_files.includes(f)
  );

  const completionRate =
    summary.planned_files.length > 0
      ? Math.round((completed.length / summary.planned_files.length) * 100)
      : 100;

  return (
    <div className="mx-3 mb-2">
      <div className="rounded-xl border border-border/60 bg-card shadow-md overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Plan → Execution Diff
            </span>
            <span className="text-[10px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5">
              {completionRate}% complete
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-4 pb-3 space-y-2 border-t border-border/40">
                {/* Completed */}
                {completed.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Completed ({completed.length})
                    </p>
                    {completed.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-2 py-0.5 text-xs text-green-400"
                      >
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skipped */}
                {summary.skipped.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Skipped ({summary.skipped.length})
                    </p>
                    {summary.skipped.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-2 py-0.5 text-xs text-amber-400"
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Extra files */}
                {extra.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Additional Files ({extra.length})
                    </p>
                    {extra.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-2 py-0.5 text-xs text-blue-400"
                      >
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
