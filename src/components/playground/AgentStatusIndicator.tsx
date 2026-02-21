import type { AgentStatus } from "@/types/chat";

export const AgentStatusIndicator = ({ status }: { status: AgentStatus }) => {
  if (status.state === "idle") return null;

  const labels: Record<string, string> = {
    thinking: "Thinking",
    planning: "Planning",
    writing: status.detail || "Writing code",
    applying: "Applying changes",
    done: "Done",
  };

  const label = labels[status.state] || "";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
      {status.state !== "done" && (
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
        </span>
      )}
      <span>{label}</span>
    </div>
  );
};
