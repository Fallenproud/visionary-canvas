import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  display_name: string | null;
  email: string;
  plan: string;
  roles: string[];
  created_at: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

async function fetchAdminUsers(
  search: string,
  page: number,
  limit: number
): Promise<AdminUsersResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?${params}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch users");
  }

  return res.json();
}

export function useAdminUsers(search: string, page: number, limit = 20) {
  return useQuery({
    queryKey: ["admin-users", search, page, limit],
    queryFn: () => fetchAdminUsers(search, page, limit),
    staleTime: 30_000,
  });
}

async function manageRole(params: {
  action: "assign" | "revoke";
  user_id: string;
  role: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-role`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to manage role");
  }

  return res.json();
}

export function useManageRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: manageRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
