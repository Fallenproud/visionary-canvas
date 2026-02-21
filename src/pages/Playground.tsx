import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useProject, useProjectFiles } from "@/hooks/useProject";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileTree } from "@/components/playground/FileTree";
import { CodeViewer } from "@/components/playground/CodeViewer";
import { PreviewPanel } from "@/components/playground/PreviewPanel";
import { ChatPanel } from "@/components/playground/ChatPanel";
import { projectFilesToSandpackFiles } from "@/lib/sandpack-config";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgentMode } from "@/types/chat";

const Playground = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: project } = useProject(projectId);
  const { data: projectFiles } = useProjectFiles(projectId);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { messages, status, isLoading, sendMessage, loadMessages } = useChat(
    projectId || "",
    conversationId
  );

  // Create or load conversation
  useEffect(() => {
    if (!projectId || !user) return;
    const init = async () => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (convs && convs.length > 0) {
        setConversationId(convs[0].id);
        loadMessages(convs[0].id);
      } else {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ project_id: projectId, user_id: user.id, title: "Chat" })
          .select()
          .single();
        if (newConv) setConversationId(newConv.id);
      }
    };
    init();
  }, [projectId, user]);

  // Auto-select first file
  useEffect(() => {
    if (projectFiles?.length && !selectedFile) {
      setSelectedFile(projectFiles[0].file_path);
    }
  }, [projectFiles]);

  const selectedContent = projectFiles?.find((f) => f.file_path === selectedFile)?.content || "";
  const sandpackFiles = projectFilesToSandpackFiles(projectFiles || []);

  const handleSend = (content: string, mode: AgentMode) => {
    if (!conversationId) return;
    sendMessage(
      content,
      mode,
      conversationId,
      (projectFiles || []).map((f) => ({ file_path: f.file_path, content: f.content }))
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="h-12 border-b border-border/50 flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">A</span>
        </div>
        <span className="font-semibold text-sm">{project?.name || "Loading..."}</span>
        <span className="text-xs text-muted-foreground capitalize ml-2 px-2 py-0.5 bg-secondary rounded">
          {project?.status || "..."}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* File tree */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
            <FileTree
              files={(projectFiles || []).map((f) => ({ file_path: f.file_path, content: f.content }))}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
          </ResizablePanel>
          <ResizableHandle />

          {/* Code viewer */}
          <ResizablePanel defaultSize={35} minSize={20}>
            <CodeViewer filePath={selectedFile} content={selectedContent} />
          </ResizablePanel>
          <ResizableHandle />

          {/* Preview */}
          <ResizablePanel defaultSize={25} minSize={15}>
            <PreviewPanel files={sandpackFiles} />
          </ResizablePanel>
          <ResizableHandle />

          {/* Chat */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <ChatPanel
              messages={messages}
              status={status}
              isLoading={isLoading}
              onSend={handleSend}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Playground;
