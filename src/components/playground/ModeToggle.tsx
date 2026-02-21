import { motion } from "framer-motion";
import type { AgentMode } from "@/types/chat";

interface ModeToggleProps {
  mode: AgentMode;
  onChange: (mode: AgentMode) => void;
}

export const ModeToggle = ({ mode, onChange }: ModeToggleProps) => {
  return (
    <div className="flex items-center bg-secondary/60 rounded-lg p-0.5 text-xs shrink-0">
      {(["plan", "agent"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`relative px-2.5 py-1 rounded-md transition-colors font-medium capitalize ${
            mode === m
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {mode === m && (
            <motion.div
              layoutId="mode-toggle-bg"
              className="absolute inset-0 bg-background rounded-md shadow-sm"
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
            />
          )}
          <span className="relative z-10">{m}</span>
        </button>
      ))}
    </div>
  );
};
