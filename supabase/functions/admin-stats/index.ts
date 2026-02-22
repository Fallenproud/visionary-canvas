import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Validate user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
    const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();

    // Run all queries in parallel
    const [
      usersTotal,
      users7d,
      users30d,
      projectsTotal,
      projects7d,
      projects30d,
      convsTotal,
      msgsTotal,
      msgs7d,
      profilesList,
      rolesList,
      projectsList,
      recentUsers,
      recentProjects,
      storageBuckets,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", d7),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", d30),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .gte("created_at", d7),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .gte("created_at", d30),
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .gte("created_at", d7),
      supabase.from("profiles").select("plan"),
      supabase.from("user_roles").select("role"),
      supabase.from("projects").select("status, framework"),
      supabase
        .from("profiles")
        .select("id, display_name, plan, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("projects")
        .select("id, name, status, framework, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.storage.listBuckets(),
    ]);

    // Aggregate plan distribution
    const byPlan: Record<string, number> = {};
    (profilesList.data || []).forEach((p: { plan: string }) => {
      byPlan[p.plan] = (byPlan[p.plan] || 0) + 1;
    });

    // Aggregate role counts
    const roleCounts: Record<string, number> = {};
    (rolesList.data || []).forEach((r: { role: string }) => {
      roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
    });

    // Aggregate project status & framework
    const byStatus: Record<string, number> = {};
    const byFramework: Record<string, number> = {};
    (projectsList.data || []).forEach(
      (p: { status: string; framework: string }) => {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
        byFramework[p.framework] = (byFramework[p.framework] || 0) + 1;
      }
    );

    // Get emails for recent users
    const recentUsersWithEmail = [];
    for (const u of recentUsers.data || []) {
      const {
        data: { user: authUser },
      } = await supabase.auth.admin.getUserById(u.id);
      recentUsersWithEmail.push({
        ...u,
        email: authUser?.email || "N/A",
      });
    }

    // Get owner names for recent projects
    const ownerIds = [
      ...new Set(
        (recentProjects.data || []).map(
          (p: { user_id: string }) => p.user_id
        )
      ),
    ];
    const { data: ownerProfiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds);
    const ownerMap = new Map(
      (ownerProfiles || []).map((p: { id: string; display_name: string }) => [
        p.id,
        p.display_name,
      ])
    );

    const recentProjectsEnriched = (recentProjects.data || []).map(
      (p: {
        id: string;
        name: string;
        status: string;
        framework: string;
        created_at: string;
        user_id: string;
      }) => ({
        ...p,
        owner_name: ownerMap.get(p.user_id) || "Unknown",
      })
    );

    // DB table counts
    const tableCounts: Record<string, number> = {
      profiles: usersTotal.count || 0,
      projects: projectsTotal.count || 0,
      conversations: convsTotal.count || 0,
      messages: msgsTotal.count || 0,
    };

    const response = {
      users: {
        total: usersTotal.count || 0,
        last7d: users7d.count || 0,
        last30d: users30d.count || 0,
        byPlan,
      },
      roles: roleCounts,
      projects: {
        total: projectsTotal.count || 0,
        last7d: projects7d.count || 0,
        last30d: projects30d.count || 0,
        byStatus,
        byFramework,
      },
      conversations: { total: convsTotal.count || 0 },
      messages: { total: msgsTotal.count || 0, last7d: msgs7d.count || 0 },
      recentUsers: recentUsersWithEmail,
      recentProjects: recentProjectsEnriched,
      storage: {
        buckets: (storageBuckets.data || []).map(
          (b: { name: string; public: boolean }) => ({
            name: b.name,
            public: b.public,
          })
        ),
      },
      tableCounts,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
