export interface WorkflowNode {
  id: string;
  label: string;
  type: "start" | "process" | "decision" | "end";
  x: number;
  y: number;
  description?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
