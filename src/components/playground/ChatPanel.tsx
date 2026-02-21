import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ModeToggle } from "./ModeToggle";
import { AgentStatusIndicator } from "./AgentStatusIndicator";
import type { Message, AgentMode, AgentStatus } from "@/types/chat";

interface ChatPanelProps {
  messages: Message[];
  status: AgentStatus;
  isLoading: boolean;
  onSend: (content: string, mode: AgentMode) => void;
}

export const ChatPanel = ({ messages, status, isLoading, onSend }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AgentMode>("agent");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim(), mode);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
          <span className="text-xs font-bold text-white">A</span>
        </div>
        <span className="font-semibold text-sm">AIKO</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            <p className="font-medium mb-1">Hi! I'm AIKO 👋</p>
            <p>Describe what you want to build and I'll help you create it.</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Status */}
      {status.state !== "idle" && (
        <AgentStatusIndicator status={status} />
      )}

      {/* ChatGPT-style input bar */}
      <div className="p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-secondary/50 p-1.5">
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
            className="flex-1 bg-transparent resize-none text-sm outline-none placeholder:text-muted-foreground py-1.5 px-2 max-h-[120px]"
            disabled={isLoading}
          />
          {input.trim() && (
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="w-7 h-7 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
