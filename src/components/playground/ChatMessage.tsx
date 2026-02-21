import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { TaskCard } from "./TaskCard";
import { formatAssistantContent } from "@/lib/chat-formatter";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  onFileClick?: (filePath: string) => void;
}

export const ChatMessage = ({ message, onFileClick }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [expanded, setExpanded] = useState(false);

  const filesChanged = (message.metadata as Record<string, unknown>)?.files_changed as string[] | undefined;

  const { display, fullDisplay, isTruncated } = !isUser
    ? formatAssistantContent(message.content)
    : { display: message.content, fullDisplay: message.content, isTruncated: false };

  const displayContent = expanded ? fullDisplay : display;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className="max-w-[85%] space-y-2">
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-accent text-white rounded-br-md"
              : "bg-secondary/60 text-foreground rounded-bl-md border border-border/20"
          }`}
        >
          <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-xs [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:mb-1.5 [&_ol]:mb-1.5">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
          {!isUser && isTruncated && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[11px] text-accent mt-2 hover:underline font-medium"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* TaskCard outside the bubble */}
        {!isUser && filesChanged && filesChanged.length > 0 && onFileClick && (
          <TaskCard files={filesChanged} onFileClick={onFileClick} />
        )}
      </div>
    </motion.div>
  );
};
