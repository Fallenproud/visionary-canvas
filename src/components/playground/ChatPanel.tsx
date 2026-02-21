import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim(), mode);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full border-l border-border/50 bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <span className="font-semibold text-sm">AIKO</span>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
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
        <div className="px-4 py-1">
          <AgentStatusIndicator status={status} />
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={mode === "plan" ? "Describe your plan..." : "Tell AIKO what to build..."}
            className="flex-1 bg-secondary rounded-lg px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
