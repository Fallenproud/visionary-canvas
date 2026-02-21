import type { AgentMode } from "@/types/chat";

interface ModeToggleProps {
  mode: AgentMode;
  onChange: (mode: AgentMode) => void;
}

export const ModeToggle = ({ mode, onChange }: ModeToggleProps) => {
  return (
    <div className="flex items-center bg-secondary rounded-lg p-0.5 text-sm">
      <button
        onClick={() => onChange("plan")}
        className={`px-3 py-1 rounded-md transition-colors font-medium ${
          mode === "plan"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Plan
      </button>
      <button
        onClick={() => onChange("agent")}
        className={`px-3 py-1 rounded-md transition-colors font-medium ${
          mode === "agent"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Agent
      </button>
    </div>
  );
};
