import { Brain, FileText, Check, Loader2 } from "lucide-react";
import type { AgentStatus } from "@/types/chat";

export const AgentStatusIndicator = ({ status }: { status: AgentStatus }) => {
  if (status.state === "idle") return null;

  const config = {
    thinking: { icon: Loader2, label: "AIKO is thinking...", color: "text-accent", spin: true },
    planning: { icon: Brain, label: "AIKO is planning...", color: "text-purple-400", spin: false },
    writing: { icon: FileText, label: status.detail || "Writing code...", color: "text-blue-400", spin: false },
    applying: { icon: Loader2, label: "Applying changes...", color: "text-yellow-400", spin: true },
    done: { icon: Check, label: "Changes applied", color: "text-green-400", spin: false },
  }[status.state];

  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-secondary/50 border border-border/50">
      <Icon className={`w-3.5 h-3.5 ${config.color} ${config.spin ? "animate-spin" : ""}`} />
      <span className={config.color}>{config.label}</span>
    </div>
  );
};
