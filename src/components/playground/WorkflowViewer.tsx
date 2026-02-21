import { useState } from "react";
import { WorkflowList } from "./WorkflowList";
import { WorkflowCanvas } from "./WorkflowCanvas";
import type { Workflow } from "@/types/workflow";

interface WorkflowViewerProps {
  workflows: Workflow[];
}

export const WorkflowViewer = ({ workflows }: WorkflowViewerProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeWorkflow = workflows.find((wf) => wf.id === activeId) || null;

  return (
    <div className="h-full flex">
      <div className="w-[30%] min-w-[180px] max-w-[260px] border-r border-border/30">
        <WorkflowList workflows={workflows} activeId={activeId} onSelect={setActiveId} />
      </div>
      <div className="flex-1 bg-background/50">
        <WorkflowCanvas workflow={activeWorkflow} />
      </div>
    </div>
  );
};
