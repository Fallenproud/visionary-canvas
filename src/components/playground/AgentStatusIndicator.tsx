import { motion } from "framer-motion";
import type { AgentStatus } from "@/types/chat";

export const AgentStatusIndicator = ({ status }: { status: AgentStatus }) => {
  if (status.state === "idle") return null;

  const labels: Record<string, string> = {
    thinking: "Thinking",
    planning: "Planning",
    writing: status.detail || "Writing code",
    applying: "Applying changes",
    done: "Done",
  };

  const label = labels[status.state] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground"
    >
      {status.state !== "done" && (
        <span className="flex gap-[3px]">
          <span className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
        </span>
      )}
      {status.state === "done" && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      )}
      <span className="font-medium">{label}</span>
    </motion.div>
  );
};
