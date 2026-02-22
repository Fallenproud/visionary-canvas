import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { formatAssistantContent } from "@/lib/chat-formatter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  onFileClick?: (filePath: string) => void;
}

const CodeBlockWithCopy = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative group/code">
      <pre className={className} {...props}>
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1 rounded bg-background/80 border border-border/40 opacity-0 group-hover/code:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        title="Copy code"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
};

export const ChatMessage = ({ message, onFileClick }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [expanded, setExpanded] = useState(false);

  const filesChanged = (message.metadata as Record<string, unknown>)?.files_changed as string[] | undefined;

  const { display, fullDisplay, isTruncated } = !isUser
    ? formatAssistantContent(message.content)
    : { display: message.content, fullDisplay: message.content, isTruncated: false };

  const displayContent = expanded ? fullDisplay : display;

  const timestamp = message.created_at
    ? format(new Date(message.created_at), "MMM d, h:mm a")
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className="max-w-[85%] space-y-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-secondary/60 text-foreground rounded-bl-md border border-border/20"
                }`}
              >
                <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-xs [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:mb-1.5 [&_ol]:mb-1.5">
                  <ReactMarkdown
                    components={{
                      pre: CodeBlockWithCopy,
                    }}
                  >
                    {displayContent}
                  </ReactMarkdown>
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
            </TooltipTrigger>
            {timestamp && (
              <TooltipContent side="bottom" className="text-xs">
                {timestamp}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {!isUser && filesChanged && filesChanged.length > 0 && onFileClick && (
          <TaskCard files={filesChanged} onFileClick={onFileClick} />
        )}
      </div>
    </motion.div>
  );
};
