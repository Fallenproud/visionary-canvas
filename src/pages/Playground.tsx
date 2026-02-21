import { useState, useEffect } from "react";
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
import { RightPaneToggle } from "@/components/playground/RightPaneToggle";
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
  const [rightPane, setRightPane] = useState<"preview" | "explorer">("preview");
  const { data: snapshots = [] } = useSnapshots(projectId);
  const createSnapshot = useCreateSnapshot();
  const revertToSnapshot = useRevertToSnapshot();
  const { messages, status, isLoading, sendMessage, loadMessages } = useChat(
    projectId || "",
    conversationId
  );

  useEffect(() => {
    if (!conversationId) return;
    loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  useEffect(() => {
    if (changedFiles.length > 0) {
      toast.info(
        <>
          AI made changes to:
          <ul className="mt-1 ml-3 list-disc">
            {changedFiles.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      );
    }
  }, [changedFiles]);

  useEffect(() => {
    if (projectFiles?.length && !selectedFile) {
      setSelectedFile(projectFiles[0].file_path);
    }
  }, [projectFiles]);

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

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.content) {
      const blocks = parseCodeBlocks(lastMsg.content);
      if (blocks.length > 0) {
        setChangedFiles(blocks.map((b) => b.filePath));
        const timer = setTimeout(() => setChangedFiles([]), 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

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
        // Non-blocking
      }
    }

    sendMessage(
      content,
      mode,
      conversationId,
      (projectFiles || []).map((f) => ({ file_path: f.file_path, content: f.content }))
    );
  };

  const handleFileClick = (filePath: string) => {
    setRightPane("explorer");
    setSelectedFile(filePath.startsWith("/") ? filePath : `/${filePath}`);
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
      <div className="h-12 border-b border-border/40 flex items-center px-4 gap-3 shrink-0 bg-card/60 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-lg hover:bg-secondary/80 transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="h-5 w-px bg-border/40" />
        <div className="w-6 h-6 rounded-md bg-accent shadow-sm shadow-accent/20 flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-[10px]">A</span>
        </div>
        <span className="font-semibold text-sm tracking-tight">{project?.name || "Loading..."}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider ml-1 px-2 py-0.5 bg-secondary/80 rounded-md font-medium">
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

      {/* 2-pane layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left: Chat */}
          <ResizablePanel defaultSize={38} minSize={28} maxSize={50}>
            <ChatPanel
              messages={messages}
              status={status}
              isLoading={isLoading}
              onSend={handleSend}
              onFileClick={handleFileClick}
            />
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border/30 hover:bg-accent/50 transition-colors data-[resize-handle-active]:bg-accent" />

          {/* Right: Preview or Explorer */}
          <ResizablePanel defaultSize={62} minSize={40}>
            <div className="relative h-full surface-subtle">
              <RightPaneToggle value={rightPane} onChange={setRightPane} />

              {rightPane === "preview" ? (
                <div className="h-full pt-4">
                  <PreviewPanel files={sandpackFiles} projectId={projectId} />
                </div>
              ) : (
                <div className="h-full pt-4 flex">
                  <div className="w-1/3 border-r border-border/30 overflow-hidden">
                    <FileTree
                      files={(projectFiles || []).map((f) => ({
                        file_path: f.file_path,
                        content: f.content,
                      }))}
                      selectedFile={selectedFile}
                      onSelectFile={setSelectedFile}
                      changedFiles={changedFiles}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CodeViewer filePath={selectedFile} content={selectedContent} />
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Playground;
