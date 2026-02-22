import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  users: {
    total: number;
    last7d: number;
    last30d: number;
    byPlan: Record<string, number>;
  };
  roles: Record<string, number>;
  projects: {
    total: number;
    last7d: number;
    last30d: number;
    byStatus: Record<string, number>;
    byFramework: Record<string, number>;
  };
  conversations: { total: number };
  messages: { total: number; last7d: number };
  recentUsers: Array<{
    id: string;
    display_name: string | null;
    email: string;
    plan: string;
    created_at: string;
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    status: string;
    framework: string;
    created_at: string;
    owner_name: string;
  }>;
  storage: {
    buckets: Array<{ name: string; public: boolean }>;
  };
  tableCounts: Record<string, number>;
}

async function fetchAdminStats(): Promise<AdminStats> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch admin stats");
  }

  return res.json();
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    staleTime: 30_000,
    retry: 1,
  });
}
