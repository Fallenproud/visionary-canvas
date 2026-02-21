import ReactMarkdown from "react-markdown";
import { TaskCard } from "./TaskCard";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  onFileClick?: (filePath: string) => void;
}

export const ChatMessage = ({ message, onFileClick }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const filesChanged = (message.metadata as Record<string, unknown>)?.files_changed as string[] | undefined;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground"
        }`}
      >
        {!isUser && (
          <span className="text-xs font-semibold text-accent block mb-1">AIKO</span>
        )}
        <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-xs">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {!isUser && filesChanged && filesChanged.length > 0 && onFileClick && (
          <TaskCard files={filesChanged} onFileClick={onFileClick} />
        )}
      </div>
    </div>
  );
};
