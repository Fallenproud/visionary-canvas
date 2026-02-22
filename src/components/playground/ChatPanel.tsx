import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowUp, Sparkles, RotateCcw, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { ModeToggle } from "./ModeToggle";
import { AgentStatusIndicator } from "./AgentStatusIndicator";
import { PlanCard } from "./PlanCard";
import { VersionHistoryDropdown } from "./VersionHistoryDropdown";
import type { Message, AgentMode, AgentStatus } from "@/types/chat";
import type { Snapshot } from "@/hooks/useSnapshots";

interface ChatPanelProps {
  messages: Message[];
  status: AgentStatus;
  isLoading: boolean;
  isOnline?: boolean;
  onSend: (content: string, mode: AgentMode) => void;
  onFileClick?: (filePath: string) => void;
  projectId: string;
  onPlanApprove?: (content: string) => void;
  snapshots?: Snapshot[];
  isReverting?: boolean;
  onRevert?: (snapshot: Snapshot) => void;
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

export const ChatPanel = ({ messages, status, isLoading, isOnline = true, onSend, onFileClick, projectId, onPlanApprove, snapshots = [], isReverting = false, onRevert }: ChatPanelProps) => {
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      // Cmd+K to clear chat
      if (isMod && e.key === "k") {
        e.preventDefault();
        // Don't clear if loading
        if (!isLoading) setInput("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLoading]);

  const latestPlan = useMemo(() => {
    if (planDismissed) return null;
    const planMsg = [...messages].reverse().find(
      (m) => m.role === "assistant" && m.metadata?.sub_agent === "plan"
    );
    return planMsg?.content || null;
  }, [messages, planDismissed]);

  const latestExecutionSummary = useMemo(() => {
    const execMsg = [...messages].reverse().find(
      (m) => m.role === "assistant" && m.metadata?.execution_summary
    );
    return execMsg?.metadata?.execution_summary || null;
  }, [messages]);

  useEffect(() => {
    setPlanDismissed(false);
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim(), mode);
    setInput("");
  };

  // Regenerate: resend the last user message
  const lastUserMsg = useMemo(() => {
    return [...messages].reverse().find((m) => m.role === "user");
  }, [messages]);

  const handleRegenerate = () => {
    if (!lastUserMsg || isLoading) return;
    onSend(lastUserMsg.content, mode);
  };

  const handlePlanApprove = (content: string) => {
    onPlanApprove?.(content);
    onSend(`Execute this plan:\n${content}`, "agent");
    setPlanDismissed(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent shadow-md shadow-accent/25 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight tracking-tight">AIKO</span>
          <span className="text-[10px] text-muted-foreground leading-tight">AI Assistant</span>
        </div>
        {onRevert && (
          <div className="ml-auto">
            <VersionHistoryDropdown
              snapshots={snapshots}
              isReverting={isReverting}
              onRevert={onRevert}
            />
          </div>
        )}
      </div>

      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-500/15 border-b border-yellow-500/30 px-4 py-2 flex items-center gap-2 text-xs text-yellow-400 overflow-hidden"
          >
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>You're offline. Reconnecting…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide">
        {messages.length === 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            className="flex flex-col items-center justify-center py-20"
          >
            <motion.div variants={scaleIn} className="w-16 h-16 rounded-2xl bg-accent/10 ring-1 ring-accent/20 shadow-lg shadow-accent/10 flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7 text-accent" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-xl font-bold text-foreground tracking-tight mb-1.5">
              Hi! I'm AIKO 👋
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-muted-foreground text-center max-w-[260px]">
              Describe what you want to build and I'll help you create it.
            </motion.p>
          </motion.div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onFileClick={onFileClick} />
        ))}

        {/* Regenerate button */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
          <div className="flex justify-start pl-1">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded-md hover:bg-secondary/60"
            >
              <RotateCcw className="w-3 h-3" />
              Regenerate
            </button>
          </div>
        )}
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
              executionSummary={latestExecutionSummary}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      {status.state !== "idle" && (
        <AgentStatusIndicator status={status} />
      )}

      {/* Input bar */}
      <div className="p-3 pt-1">
        <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-lg shadow-black/5 overflow-hidden">
          <div className="flex items-end gap-2 p-3">
            <ModeToggle mode={mode} onChange={setMode} />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Enter to send, Shift+Enter for newline, Cmd+Enter also sends
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={mode === "plan" ? "Describe your plan..." : "Tell AIKO what to build..."}
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm outline-none placeholder:text-muted-foreground/60 py-2 px-1 max-h-[140px] min-h-[44px] leading-relaxed"
              disabled={isLoading}
            />
            <motion.button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              initial={false}
              animate={{ scale: input.trim() ? 1 : 0.8, opacity: input.trim() ? 1 : 0.3 }}
              transition={{ duration: 0.15 }}
              className="w-8 h-8 shrink-0 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-30 shadow-sm shadow-accent/20"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
          ⌘K clear · ⌘Enter send
        </p>
      </div>
    </div>
  );
};
