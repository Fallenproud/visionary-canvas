import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { ModeToggle } from "./ModeToggle";
import { AgentStatusIndicator } from "./AgentStatusIndicator";
import { PlanCard } from "./PlanCard";
import type { Message, AgentMode, AgentStatus } from "@/types/chat";

interface ChatPanelProps {
  messages: Message[];
  status: AgentStatus;
  isLoading: boolean;
  onSend: (content: string, mode: AgentMode) => void;
  onFileClick?: (filePath: string) => void;
}

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const scaleIn = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring" as const, damping: 15, stiffness: 200 } },
};

export const ChatPanel = ({ messages, status, isLoading, onSend, onFileClick }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AgentMode>("agent");
  const [planDismissed, setPlanDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [input]);

  const latestPlan = useMemo(() => {
    if (planDismissed) return null;
    const planMsg = [...messages].reverse().find(
      (m) => m.role === "assistant" && m.metadata?.sub_agent === "plan"
    );
    return planMsg?.content || null;
  }, [messages, planDismissed]);

  useEffect(() => {
    setPlanDismissed(false);
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim(), mode);
    setInput("");
  };

  const handlePlanApprove = (content: string) => {
    onSend(`Execute this plan:\n${content}`, "agent");
    setPlanDismissed(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent shadow-md shadow-accent/20 flex items-center justify-center">
          <span className="text-xs font-bold text-white">A</span>
        </div>
        <span className="font-semibold text-sm">AIKO</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            className="flex flex-col items-center justify-center py-20"
          >
            <motion.div variants={scaleIn} className="w-14 h-14 rounded-2xl bg-accent shadow-lg shadow-accent/20 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">A</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-foreground drop-shadow-sm mb-2">
              Hi! I'm AIKO 👋
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-muted-foreground">
              Describe what you want to build and I'll help you create it.
            </motion.p>
          </motion.div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onFileClick={onFileClick} />
        ))}
      </div>

      {/* Plan Card */}
      <AnimatePresence>
        {latestPlan && (
          <motion.div
            key="plan-card"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <PlanCard
              content={latestPlan}
              isLoading={isLoading && status.state === "planning"}
              onApprove={handlePlanApprove}
              onDismiss={() => setPlanDismissed(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      {status.state !== "idle" && (
        <AgentStatusIndicator status={status} />
      )}

      {/* Input bar */}
      <div className="p-3">
        <div className="flex items-end gap-2 rounded-3xl border border-border bg-secondary/50 p-3">
          <ModeToggle mode={mode} onChange={setMode} />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={mode === "plan" ? "Describe your plan..." : "Tell AIKO what to build..."}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm outline-none placeholder:text-muted-foreground py-2 px-2 max-h-[140px] min-h-[44px]"
            disabled={isLoading}
          />
          {input.trim() && (
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
