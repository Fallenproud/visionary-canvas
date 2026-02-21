import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Message, AgentStatus, AgentMode } from "@/types/chat";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aiko-chat`;

export function useChat(projectId: string, conversationId: string | null) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<AgentStatus>({ state: 'idle' });
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at");
    if (data) setMessages(data as Message[]);
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    mode: AgentMode,
    convId: string,
    projectFiles: Array<{ file_path: string; content: string }>
  ) => {
    if (!session) return;
    setIsLoading(true);
    setStatus({ state: mode === 'plan' ? 'planning' : 'thinking', detail: 'AIKO is analyzing your request...' });

    // Save user message
    const { data: savedMsg } = await supabase
      .from("messages")
      .insert({ conversation_id: convId, role: "user" as const, content })
      .select()
      .single();
    if (savedMsg) setMessages(prev => [...prev, savedMsg as Message]);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content }].map(m => ({ role: m.role, content: m.content })),
          mode,
          project_files: projectFiles.slice(0, 10), // Send limited context
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

      // Save assistant message
      if (assistantContent) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant" as const,
          content: assistantContent,
          metadata: { sub_agent: mode },
        });
      }

      setStatus({ state: 'done', detail: 'Changes applied' });
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
  }, [session, messages]);

  return { messages, setMessages, status, isLoading, sendMessage, loadMessages };
}
