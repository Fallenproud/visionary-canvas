import { GitBranch } from "lucide-react";
import type { Workflow } from "@/types/workflow";

interface WorkflowListProps {
  workflows: Workflow[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const WorkflowList = ({ workflows, activeId, onSelect }: WorkflowListProps) => {
  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No workflows yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Workflows will appear here as AIKO creates them during execution.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2 overflow-y-auto scrollbar-hide h-full">
      {workflows.map((wf) => (
        <button
          key={wf.id}
          onClick={() => onSelect(wf.id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
            activeId === wf.id
              ? "bg-accent/15 border border-accent/30 text-foreground"
              : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span className="text-sm font-medium truncate">{wf.name}</span>
          </div>
          {wf.description && (
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 pl-5.5">
              {wf.description}
            </p>
          )}
        </button>
      ))}
    </div>
  );
};
