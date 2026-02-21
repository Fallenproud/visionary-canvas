import ReactMarkdown from "react-markdown";
import type { Message } from "@/types/chat";

export const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

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
      </div>
    </div>
  );
};
