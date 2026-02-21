import { useState, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, Pencil, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  content: string;
  isLoading: boolean;
  onApprove: (content: string) => void;
  onDismiss: () => void;
}

/** Extract numbered steps from markdown content */
function extractSteps(md: string): string[] {
  const lines = md.split("\n");
  return lines
    .filter((l) => /^\s*\d+[\.\)]\s+/.test(l))
    .map((l) => l.replace(/^\s*\d+[\.\)]\s+/, "").trim());
}

export const PlanCard = ({ content, isLoading, onApprove, onDismiss }: PlanCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  // Sync editContent when content streams in
  useEffect(() => {
    if (!isEditing) {
      setEditContent(content);
    }
  }, [content, isEditing]);

  const steps = useMemo(() => extractSteps(content), [content]);

  const handleApprove = () => {
    onApprove(isEditing ? editContent : content);
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditContent(content);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="mx-3 mb-2">
      <div className="rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden relative">
        {/* Accent gradient border */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary via-primary/60 to-primary/20 rounded-l-xl" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 pl-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Plan</span>
            {steps.length > 0 && !isLoading && (
              <span className="text-[10px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-full">
                {steps.length} step{steps.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onDismiss}
              className="p-1 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
              title="Dismiss plan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-4 py-3 max-h-[280px] overflow-y-auto pl-5">
                {isLoading ? (
                  <div className="space-y-2.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-3 rounded-full relative overflow-hidden bg-muted"
                        style={{ width: `${70 + Math.random() * 30}%` }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
                      </div>
                    ))}
                  </div>
                ) : isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[160px] bg-secondary/50 rounded-lg p-3 text-sm text-foreground outline-none resize-none border border-border/40 focus:border-primary/50 transition-colors"
                  />
                ) : (
                  <>
                    {/* Step progress indicator */}
                    {steps.length > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        {steps.map((_, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
                              {i + 1}
                            </div>
                            {i < steps.length - 1 && (
                              <div className="w-4 h-[1px] bg-border/60" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="prose prose-sm prose-invert max-w-none text-muted-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_li]:text-muted-foreground">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-border/40 pl-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  className="gap-1.5 text-xs"
                >
                  <Pencil className="w-3 h-3" />
                  {isEditing ? "Preview" : "Edit"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  className="gap-1.5 text-xs bg-primary hover:bg-primary/90"
                >
                  <Check className="w-3 h-3" />
                  Approve
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
