import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useProject, useProjectFiles } from "@/hooks/useProject";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { parseCodeBlocks } from "@/lib/code-parser";
import { useAuth } from "@/contexts/AuthContext";
import { FileTree } from "@/components/playground/FileTree";
import { CodeViewer } from "@/components/playground/CodeViewer";
import { PreviewPanel } from "@/components/playground/PreviewPanel";
import { ChatPanel } from "@/components/playground/ChatPanel";
import { VersionHistoryDropdown } from "@/components/playground/VersionHistoryDropdown";
import { projectFilesToSandpackFiles } from "@/lib/sandpack-config";
import { useSnapshots, useCreateSnapshot, useRevertToSnapshot } from "@/hooks/useSnapshots";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AgentMode } from "@/types/chat";

const Playground = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: project } = useProject(projectId);
  const { data: projectFiles } = useProjectFiles(projectId);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const { data: snapshots = [] } = useSnapshots(projectId);
  const createSnapshot = useCreateSnapshot();
  const revertToSnapshot = useRevertToSnapshot();
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

  // Track changed files from assistant messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && lastMsg.content) {
      const blocks = parseCodeBlocks(lastMsg.content);
      if (blocks.length > 0) {
        setChangedFiles(blocks.map((b) => b.filePath));
        // Clear indicators after 10 seconds
        const timer = setTimeout(() => setChangedFiles([]), 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  // Auto-select first file
  useEffect(() => {
    if (projectFiles?.length && !selectedFile) {
      setSelectedFile(projectFiles[0].file_path);
    }
  }, [projectFiles]);

  const selectedContent = projectFiles?.find((f) => f.file_path === selectedFile)?.content || "";
  const sandpackFiles = projectFilesToSandpackFiles(projectFiles || []);

  const handleSend = async (content: string, mode: AgentMode) => {
    if (!conversationId || !projectId) return;
    setChangedFiles([]);

    // Auto-save a snapshot before AIKO makes changes (only if files exist)
    if (projectFiles && projectFiles.length > 0) {
      try {
        await createSnapshot.mutateAsync({
          projectId,
          label: content.slice(0, 60),
          files: projectFiles.map((f) => ({
            file_path: f.file_path,
            content: f.content,
            language: f.language || undefined,
          })),
        });
      } catch {
        // Non-blocking — don't prevent chat from working
      }
    }

    sendMessage(
      content,
      mode,
      conversationId,
      (projectFiles || []).map((f) => ({ file_path: f.file_path, content: f.content }))
    );
  };

  const handleRevert = async (snapshot: (typeof snapshots)[0]) => {
    if (!projectId) return;
    try {
      await revertToSnapshot.mutateAsync({ projectId, snapshot });
      toast.success(`Reverted to v${snapshot.version}`);
    } catch {
      toast.error("Failed to revert");
    }
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
        <div className="ml-auto">
          <VersionHistoryDropdown
            snapshots={snapshots}
            isReverting={revertToSnapshot.isPending}
            onRevert={handleRevert}
          />
        </div>
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
              changedFiles={changedFiles}
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
