import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { parseCodeBlocks } from "@/lib/code-parser";
import { playCompletionSound } from "@/lib/completion-sound";
import type { Message, AgentStatus, AgentMode } from "@/types/chat";
import type { Json } from "@/integrations/supabase/types";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aiko-chat`;
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2000];

/** Extract file paths from plan markdown file tree section */
function parsePlannedFiles(planContent: string): string[] {
  const files: string[] = [];
  const lines = planContent.split("\n");
  for (const line of lines) {
    const match = line.match(/^\s+(\S+\.\w+)\s+\[(NEW|MODIFIED)\]/);
    if (match) {
      files.push(match[1]);
    }
  }
  return files;
}

/** Retry-aware fetch: retries on 5xx or network errors */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, options);
      if (resp.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt] || 2000));
        continue;
      }
      return resp;
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt] || 2000));
        continue;
      }
      throw err;
    }
  }
  // Should never reach here
  throw new Error("Max retries exceeded");
}

export function useChat(projectId: string, conversationId: string | null) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<AgentStatus>({ state: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fileSnapshotRef = useRef<Record<string, string>>({});

  // Network status detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at");
    if (data) setMessages(data as Message[]);
  }, []);

  const applyCodeBlocks = useCallback(async (content: string) => {
    if (!projectId) return [];
    const blocks = parseCodeBlocks(content);
    if (blocks.length === 0) return [];

    const filesChanged: string[] = [];

    for (const block of blocks) {
      const { error } = await supabase
        .from("project_files")
        .upsert(
          {
            project_id: projectId,
            file_path: block.filePath,
            content: block.content,
            language: block.language,
            version: 1,
          },
          { onConflict: "project_id,file_path" }
        );

      if (!error) {
        filesChanged.push(block.filePath);
      } else {
        console.error(`Failed to save ${block.filePath}:`, error);
      }
    }

    if (filesChanged.length > 0) {
      await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
    }

    return filesChanged;
  }, [projectId, queryClient]);

  const sendMessage = useCallback(async (
    content: string,
    mode: AgentMode,
    convId: string,
    projectFiles: Array<{ file_path: string; content: string }>
  ) => {
    if (!session) return;

    if (content.length > 10000) {
      const { toast } = await import("sonner");
      toast.error("Message too long — maximum 10,000 characters.");
      return;
    }

    if (!navigator.onLine) {
      const { toast } = await import("sonner");
      toast.error("You're offline. Please check your connection.");
      return;
    }

    setIsLoading(true);

    const snapshot: Record<string, string> = {};
    for (const f of projectFiles) {
      snapshot[f.file_path] = f.content;
    }
    fileSnapshotRef.current = snapshot;

    if (mode === 'agent') {
      setStatus({ state: 'routing', detail: 'Analyzing request & selecting sub-agents...' });
    } else {
      setStatus({ state: 'planning', detail: 'AIKO is analyzing your request...' });
    }

    const { data: savedMsg } = await supabase
      .from("messages")
      .insert({ conversation_id: convId, role: "user" as const, content })
      .select()
      .single();
    if (savedMsg) setMessages(prev => [...prev, savedMsg as Message]);

    try {
      const resp = await fetchWithRetry(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content }].map(m => ({ role: m.role, content: m.content })),
          mode,
          project_files: projectFiles.slice(0, 25),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      setStatus({ state: 'writing', detail: 'AIKO is generating a response...' });

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIdx);
          textBuffer = textBuffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);

          if (line.startsWith(": meta:")) {
            try {
              const meta = JSON.parse(line.slice(7));
              if (meta.sub_agents) {
                setStatus(prev => ({
                  ...prev,
                  state: 'writing',
                  detail: `Sub-agents: ${meta.sub_agents.join(", ")}`,
                  sub_agents: meta.sub_agents,
                }));
              }
            } catch {
              // ignore
            }
            continue;
          }

          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && !last.id?.startsWith('saved-')) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: `temp-${Date.now()}`, conversation_id: convId, role: 'assistant', content: assistantContent, metadata: {}, created_at: new Date().toISOString() } as Message];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      let filesChanged: string[] = [];
      if (assistantContent && mode === 'agent') {
        setStatus({ state: 'applying', detail: 'Saving generated files...' });
        filesChanged = await applyCodeBlocks(assistantContent);
      }

      let executionSummary: Record<string, unknown> | undefined;
      if (filesChanged.length > 0) {
        try {
          const { data: planFile } = await supabase
            .from("project_files")
            .select("content")
            .eq("project_id", projectId)
            .eq("file_path", "/.aiko/plan.md")
            .maybeSingle();

          if (planFile?.content) {
            const plannedFiles = parsePlannedFiles(planFile.content);
            const actualFiles = filesChanged;
            const completed = plannedFiles.filter((f) => actualFiles.includes(f));
            const skipped = plannedFiles.filter((f) => !actualFiles.includes(f));
            const added = actualFiles.filter((f) => !plannedFiles.includes(f));
            executionSummary = { planned_files: plannedFiles, actual_files: actualFiles, added, skipped };
          }
        } catch {
          // Non-blocking
        }
      }

      if (assistantContent) {
        const msgMetadata: Record<string, unknown> = {
          sub_agent: mode,
          files_changed: filesChanged,
        };
        if (status.sub_agents) msgMetadata.sub_agents = status.sub_agents;
        if (executionSummary) msgMetadata.execution_summary = executionSummary;

        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant" as const,
          content: assistantContent,
          metadata: msgMetadata as Json,
        });
      }

      setStatus({
        state: 'done',
        detail: filesChanged.length > 0
          ? `Updated ${filesChanged.length} file${filesChanged.length > 1 ? 's' : ''}`
          : 'Response complete',
        sub_agents: status.sub_agents,
      });

      if (filesChanged.length > 0) {
        playCompletionSound();
      }
    } catch (err) {
      console.error("Chat error:", err);
      setStatus({ state: 'idle' });
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        conversation_id: convId,
        role: 'assistant',
        content: `⚠️ Error: ${errorMsg}`,
        metadata: {},
        created_at: new Date().toISOString(),
      } as Message]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus({ state: 'idle' }), 3000);
    }
  }, [session, messages, applyCodeBlocks, status.sub_agents, projectId]);

  return { messages, setMessages, status, isLoading, isOnline, sendMessage, loadMessages, fileSnapshot: fileSnapshotRef.current };
}
