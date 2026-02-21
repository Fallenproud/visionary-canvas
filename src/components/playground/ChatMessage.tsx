import { useState } from "react";
import ReactMarkdown from "react-markdown";
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

  // Format assistant content — strip code blocks, truncate
  const { display, fullDisplay, isTruncated } = !isUser
    ? formatAssistantContent(message.content)
    : { display: message.content, fullDisplay: message.content, isTruncated: false };

  const displayContent = expanded ? fullDisplay : display;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className="max-w-[85%] space-y-2">
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/80 text-foreground"
          }`}
        >
          <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-xs">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
          {!isUser && isTruncated && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-accent mt-2 hover:underline"
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
    </div>
  );
};
