import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Snapshot {
  id: string;
  project_id: string;
  version: number;
  label: string;
  files: Array<{ file_path: string; content: string; language?: string }>;
  created_at: string;
}

export function useSnapshots(projectId: string | undefined) {
  return useQuery({
    queryKey: ["snapshots", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_snapshots")
        .select("*")
        .eq("project_id", projectId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Snapshot[];
    },
    enabled: !!projectId,
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      label,
      files,
    }: {
      projectId: string;
      label: string;
      files: Array<{ file_path: string; content: string; language?: string }>;
    }) => {
      // Get next version number
      const { data: latest } = await supabase
        .from("project_snapshots")
        .select("version")
        .eq("project_id", projectId)
        .order("version", { ascending: false })
        .limit(1);

      const nextVersion = latest && latest.length > 0 ? (latest[0] as any).version + 1 : 1;

      const { data, error } = await supabase
        .from("project_snapshots")
        .insert({
          project_id: projectId,
          version: nextVersion,
          label,
          files: files as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Snapshot;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["snapshots", vars.projectId] });
    },
  });
}

export function useRevertToSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      snapshot,
    }: {
      projectId: string;
      snapshot: Snapshot;
    }) => {
      // Delete all current project files
      await supabase.from("project_files").delete().eq("project_id", projectId);

      // Re-insert files from snapshot
      const filesToInsert = snapshot.files.map((f) => ({
        project_id: projectId,
        file_path: f.file_path,
        content: f.content,
        language: f.language || "typescript",
      }));

      if (filesToInsert.length > 0) {
        const { error } = await supabase.from("project_files").insert(filesToInsert);
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["project-files", vars.projectId] });
    },
  });
}
