import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FolderKanban, MessageSquare, Radio, Sparkles } from "lucide-react";

interface ActivityEvent {
  id: string;
  kind: "project" | "conversation";
  title: string;
  at: number;
}

const MAX_EVENTS = 20;

const AdminActivityFeed = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("admin-activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "projects" },
        (payload) => {
          const row = payload.new as { id: string; name: string };
          setEvents((prev) =>
            [
              { id: `p-${row.id}`, kind: "project" as const, title: row.name || "Untitled project", at: Date.now() },
              ...prev,
            ].slice(0, MAX_EVENTS)
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        (payload) => {
          const row = payload.new as { id: string; title: string };
          setEvents((prev) =>
            [
              { id: `c-${row.id}`, kind: "conversation" as const, title: row.title || "New conversation", at: Date.now() },
              ...prev,
            ].slice(0, MAX_EVENTS)
          );
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fmt = (ts: number) => {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.round(s / 60)}m ago`;
    return `${Math.round(s / 3600)}h ago`;
  };

  return (
    <div className="rounded-xl border border-border/50 p-5 surface-elevated">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-3.5 h-3.5" /> Live Activity
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connected ? "bg-green-500 animate-dot-pulse" : "bg-muted-foreground/50"
            }`}
          />
          {connected ? "Streaming" : "Connecting"}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <Sparkles className="w-4 h-4 opacity-50" />
          Waiting for new activity…
        </div>
      ) : (
        <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {events.map((e) => {
            const Icon = e.kind === "project" ? FolderKanban : MessageSquare;
            return (
              <li
                key={e.id}
                className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-muted/30 animate-fade-in"
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-3">
                  <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="truncate">
                    <span className="text-muted-foreground text-xs mr-1.5 capitalize">{e.kind}</span>
                    <span className="font-medium">{e.title}</span>
                  </span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{fmt(e.at)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminActivityFeed;
