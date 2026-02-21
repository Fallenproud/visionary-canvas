import { useState } from "react";
import { ChevronUp, ChevronDown, Pencil, Check } from "lucide-react";
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
    <div className="mx-3 mb-2 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Plan</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Body */}
        {isExpanded && (
          <>
            <div className="px-4 py-3 max-h-[280px] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 rounded-full bg-muted animate-pulse"
                      style={{ width: `${70 + Math.random() * 30}%` }}
                    />
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
            <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-border/40">
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
          </>
        )}
      </div>
    </div>
  );
};
