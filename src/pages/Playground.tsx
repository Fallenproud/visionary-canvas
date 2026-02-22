import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useProject, useProjectFiles, useUpdateProjectFile } from "@/hooks/useProject";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { parseCodeBlocks } from "@/lib/code-parser";
import { useAuth } from "@/contexts/AuthContext";
import { FileTree } from "@/components/playground/FileTree";
import { CodeViewer } from "@/components/playground/CodeViewer";
import { PreviewPanel } from "@/components/playground/PreviewPanel";
import { ChatPanel } from "@/components/playground/ChatPanel";
import { RightPaneToggle } from "@/components/playground/RightPaneToggle";
import { PlaygroundToolbar } from "@/components/playground/PlaygroundToolbar";
import { PlaygroundActions } from "@/components/playground/PlaygroundActions";
import { WorkflowViewer } from "@/components/playground/WorkflowViewer";
import { FileDiffViewer } from "@/components/playground/FileDiffViewer";
import { projectFilesToSandpackFiles } from "@/lib/sandpack-config";
import { useSnapshots, useCreateSnapshot, useRevertToSnapshot } from "@/hooks/useSnapshots";
import { useWorkflows } from "@/hooks/useWorkflows";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AgentMode } from "@/types/chat";
import type { RightPaneView } from "@/components/playground/RightPaneToggle";

const Playground = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId);
  const { data: projectFiles } = useProjectFiles(projectId);
  const updateFile = useUpdateProjectFile();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [rightPane, setRightPane] = useState<RightPaneView>("preview");
  const [isEditing, setIsEditing] = useState(false);
  const { data: snapshots = [] } = useSnapshots(projectId);
  const createSnapshot = useCreateSnapshot();
  const revertToSnapshot = useRevertToSnapshot();
  const { messages, status, isLoading, isOnline, sendMessage, loadMessages, fileSnapshot } = useChat(
    projectId || "",
    conversationId
  );
  const workflows = useWorkflows(projectFiles);
  const [diffFile, setDiffFile] = useState<string | null>(null);

  // Editable project name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (project?.name) setEditName(project.name);
  }, [project?.name]);

  const handleSaveName = async () => {
    setIsEditingName(false);
    const trimmed = editName.trim();
    if (!trimmed || !projectId || trimmed === project?.name) return;
    await supabase.from("projects").update({ name: trimmed }).eq("id", projectId);
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  };

  // --- existing effects ---
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

  const handleChangedFileClick = useCallback((filePath: string) => {
    setRightPane("explorer");
    const normalised = filePath.startsWith("/") ? filePath : `/${filePath}`;
    setSelectedFile(normalised);
    setDiffFile(normalised);
  }, []);

  const handleRevert = async (snapshot: (typeof snapshots)[0]) => {
    if (!projectId) return;
    try {
      await revertToSnapshot.mutateAsync({ projectId, snapshot });
      toast.success(`Reverted to v${snapshot.version}`);
    } catch {
      toast.error("Failed to revert");
    }
  };

  const handlePlanApprove = async (planContent: string) => {
    if (!projectId) return;

    // Determine next version number
    const existingPlans = (projectFiles || []).filter((f) =>
      f.file_path.match(/^\/.aiko\/plans\/v\d+\.md$/)
    );
    const nextVersion = existingPlans.length + 1;

    // Save versioned plan
    await supabase.from("project_files").upsert(
      {
        project_id: projectId,
        file_path: `/.aiko/plans/v${nextVersion}.md`,
        content: planContent,
        language: "markdown",
        version: 1,
      },
      { onConflict: "project_id,file_path" }
    );

    // Save active roadmap
    await supabase.from("project_files").upsert(
      {
        project_id: projectId,
        file_path: "/.aiko/plan.md",
        content: planContent,
        language: "markdown",
        version: 1,
      },
      { onConflict: "project_id,file_path" }
    );

    // Log approval event as system message
    if (conversationId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "system" as const,
        content: `✅ Plan v${nextVersion} approved and saved as roadmap.`,
        metadata: {
          event: "plan_approved",
          plan_version: nextVersion,
        },
      });
    }

    queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
  };

  const handleSaveFile = async (filePath: string, content: string) => {
    if (!projectId) return;
    try {
      await updateFile.mutateAsync({ projectId, filePath, content });
      toast.success(`Saved ${filePath}`);
    } catch {
      toast.error("Failed to save file");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="h-12 border-b border-border/40 flex items-center px-3 gap-2 shrink-0 bg-card/60 backdrop-blur-xl">
        {/* Left zone */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg hover:bg-secondary/80 transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-5 w-px bg-border/40" />
          <PlaygroundToolbar onWorkflowsClick={() => setRightPane("workflows")} />
        </div>

        {/* Center zone: project name + status */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent shadow-sm shadow-accent/20 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-[10px]">A</span>
          </div>
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") { setIsEditingName(false); setEditName(project?.name || ""); }
                }}
                className="bg-secondary/80 border border-border/40 rounded-md px-2 py-0.5 text-sm font-semibold tracking-tight outline-none focus:border-primary/50 transition-colors w-40"
              />
              <button onClick={handleSaveName} className="p-0.5 rounded hover:bg-secondary/80">
                <Check className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="font-semibold text-sm tracking-tight hover:bg-secondary/60 px-2 py-0.5 rounded-md transition-colors cursor-text"
              title="Click to rename"
            >
              {project?.name || "Loading..."}
            </button>
          )}
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-0.5 bg-secondary/80 rounded-md font-medium">
            {project?.status || "..."}
          </span>
        </div>

        {/* Right zone — version history removed, now in ChatPanel */}
        <div className="flex items-center gap-2">
          <PlaygroundActions />
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
              isOnline={isOnline}
              onSend={handleSend}
              onFileClick={handleFileClick}
              projectId={projectId || ""}
              onPlanApprove={handlePlanApprove}
              snapshots={snapshots}
              isReverting={revertToSnapshot.isPending}
              onRevert={handleRevert}
            />
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border/30 hover:bg-accent/50 transition-colors data-[resize-handle-active]:bg-accent" />

          {/* Right: Preview, Explorer, or Workflows */}
          <ResizablePanel defaultSize={62} minSize={40}>
            <div className="relative h-full surface-subtle">
              <RightPaneToggle value={rightPane} onChange={setRightPane} />

              {rightPane === "preview" ? (
                <div className="h-full pt-4">
                  <PreviewPanel files={sandpackFiles} projectId={projectId} />
                </div>
              ) : rightPane === "workflows" ? (
                <div className="h-full pt-12">
                  <WorkflowViewer workflows={workflows} />
                </div>
              ) : (
                <div className="h-full pt-12 flex relative">
                  <div className="w-1/3 border-r border-border/30 overflow-hidden">
                    <FileTree
                      files={(projectFiles || []).map((f) => ({
                        file_path: f.file_path,
                        content: f.content,
                      }))}
                      selectedFile={selectedFile}
                      onSelectFile={setSelectedFile}
                      changedFiles={changedFiles}
                      isEditing={isEditing}
                      onEditToggle={setIsEditing}
                      agentStatus={status}
                      activeWritingFiles={status.state === "writing" || status.state === "applying" ? changedFiles : []}
                      onDismissChanges={() => setChangedFiles([])}
                      onChangedFileClick={handleChangedFileClick}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CodeViewer
                      filePath={selectedFile}
                      content={selectedContent}
                      isEditing={isEditing}
                      onSave={(content) => selectedFile && handleSaveFile(selectedFile, content)}
                    />
                  </div>
                  {diffFile && (
                    <FileDiffViewer
                      filePath={diffFile}
                      beforeContent={fileSnapshot[diffFile] || ""}
                      afterContent={projectFiles?.find((f) => f.file_path === diffFile)?.content || ""}
                      onClose={() => setDiffFile(null)}
                    />
                  )}
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
