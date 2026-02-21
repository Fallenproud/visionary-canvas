import { useState, useEffect } from "react";
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
              <div className="px-4 py-3 max-h-[400px] overflow-y-auto pl-5 scrollbar-hide">
                {isLoading ? (
                  <div className="space-y-2.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-3 rounded-full relative overflow-hidden bg-muted"
                        style={{ width: `${70 + Math.random() * 30}%` }}
                      >
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
                  <div className="prose prose-sm prose-invert max-w-none text-muted-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_li]:text-muted-foreground">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
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
