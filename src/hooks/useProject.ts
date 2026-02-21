import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { templates } from "@/lib/templates";
import type { Project, ProjectFile } from "@/types/project";

export function useProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId!)
        .single();
      if (error) throw error;
      return data as Project;
    },
    enabled: !!projectId,
  });
}

export function useProjectFiles(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId!)
        .order("file_path");
      if (error) throw error;
      return data as ProjectFile[];
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { name: string; description: string; framework: 'expo' | 'react-native'; template: string }) => {
      // Create project
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: user!.id,
          name: params.name,
          description: params.description,
          framework: params.framework,
          status: "draft" as const,
        })
        .select()
        .single();
      if (error) throw error;

      // Scaffold template files
      const tmpl = templates[params.template] || templates.blank;
      const fileInserts = Object.entries(tmpl.files).map(([path, content]) => ({
        project_id: project.id,
        file_path: path,
        content,
        language: path.endsWith('.json') ? 'json' : 'typescript',
      }));

      if (fileInserts.length > 0) {
        const { error: filesError } = await supabase
          .from("project_files")
          .insert(fileInserts);
        if (filesError) throw filesError;
      }

      // Update file_tree
      const fileTree = Object.keys(tmpl.files).reduce((acc, path) => {
        acc[path] = { type: 'file' };
        return acc;
      }, {} as Record<string, any>);

      await supabase
        .from("projects")
        .update({ file_tree: fileTree })
        .eq("id", project.id);

      return project as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProjectFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { projectId: string; filePath: string; content: string }) => {
      const { error } = await supabase
        .from("project_files")
        .upsert({
          project_id: params.projectId,
          file_path: params.filePath,
          content: params.content,
          version: 1,
        }, { onConflict: "project_id,file_path" });
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["project-files", vars.projectId] }),
  });
}
