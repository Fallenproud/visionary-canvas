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

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("limit") || "20"))
    );
    const offset = (page - 1) * limit;

    // Get profiles with optional search
    let query = supabase
      .from("profiles")
      .select("id, display_name, plan, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("display_name", `%${search}%`);
    }

    const { data: profiles, count } = await query;

    // Enrich with email and roles
    const enriched = [];
    for (const p of profiles || []) {
      const [authRes, rolesRes] = await Promise.all([
        supabase.auth.admin.getUserById(p.id),
        supabase.from("user_roles").select("role").eq("user_id", p.id),
      ]);

      enriched.push({
        id: p.id,
        display_name: p.display_name,
        email: authRes.data?.user?.email || "N/A",
        plan: p.plan,
        roles: (rolesRes.data || []).map((r: { role: string }) => r.role),
        created_at: p.created_at,
      });
    }

    return new Response(
      JSON.stringify({
        users: enriched,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
