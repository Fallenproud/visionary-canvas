import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { AgentStatus } from "@/types/chat";

const dotVariants = {
  initial: { scale: 0.6, opacity: 0.3 },
  animate: (i: number) => ({
    scale: [0.6, 1.2, 0.6],
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: i * 0.2,
    },
  }),
};

export const AgentStatusIndicator = ({ status }: { status: AgentStatus }) => {
  if (status.state === "idle") return null;

  const labels: Record<string, string> = {
    thinking: "Thinking",
    planning: "Planning",
    routing: "Selecting sub-agents",
    writing: status.detail || "Writing code",
    applying: "Applying changes",
    done: status.detail || "Done",
  };

  const label = labels[status.state] || "";
  const isActive = status.state !== "done";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status.state}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center gap-2.5 px-4 py-2"
      >
        {/* Typing bubble */}
        {isActive && (
          <div className="flex items-center gap-2 bg-secondary/60 border border-border/20 rounded-2xl rounded-bl-md px-3.5 py-2">
            <Sparkles className="w-3 h-3 text-accent shrink-0" />
            <div className="flex items-center gap-[5px]">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={dotVariants}
                  initial="initial"
                  animate="animate"
                  className="w-[5px] h-[5px] rounded-full bg-accent"
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium ml-0.5">{label}</span>
          </div>
        )}

        {/* Done state */}
        {!isActive && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 300 }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
            <span className="font-medium">{label}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
