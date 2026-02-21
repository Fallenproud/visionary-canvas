import { useMemo } from "react";
import type { ProjectFile } from "@/types/project";
import type { Workflow } from "@/types/workflow";

export function useWorkflows(projectFiles: ProjectFile[] | undefined) {
  return useMemo(() => {
    if (!projectFiles) return [];
    return projectFiles
      .filter((f) => f.file_path.startsWith("/.aiko/workflows/") && f.file_path.endsWith(".json"))
      .map((f) => {
        try {
          return JSON.parse(f.content) as Workflow;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Workflow[];
  }, [projectFiles]);
}
