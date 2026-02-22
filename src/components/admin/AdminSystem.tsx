import { useState, useCallback } from "react";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Database,
  HardDrive,
  RefreshCw,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Globe,
  Server,
  Lock,
  Wifi,
} from "lucide-react";

interface HealthCheck {
  name: string;
  category: string;
  method: string;
  endpoint: string;
  status: "ok" | "error" | "checking" | "pending";
  latency?: number;
  statusCode?: number;
  message?: string;
}

interface EndpointDef {
  name: string;
  category: string;
  method: string;
  endpoint: string;
  buildRequest: (baseUrl: string, anonKey: string, token: string) => { url: string; init: RequestInit };
}

const buildEndpoints = (): EndpointDef[] => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  return [
    // Auth endpoints
    {
      name: "Auth Health",
      category: "Authentication",
      method: "GET",
      endpoint: "/auth/v1/health",
      buildRequest: (b, k) => ({
        url: `${b}/auth/v1/health`,
        init: { method: "GET", headers: { apikey: k } },
      }),
    },
    {
      name: "Auth Settings",
      category: "Authentication",
      method: "GET",
      endpoint: "/auth/v1/settings",
      buildRequest: (b, k) => ({
        url: `${b}/auth/v1/settings`,
        init: { method: "GET", headers: { apikey: k } },
      }),
    },
    // REST / PostgREST
    {
      name: "REST API Root",
      category: "Database REST",
      method: "GET",
      endpoint: "/rest/v1/",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/`,
        init: {
          method: "GET",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    {
      name: "Profiles Table",
      category: "Database REST",
      method: "HEAD",
      endpoint: "/rest/v1/profiles?limit=0",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/profiles?limit=0`,
        init: {
          method: "HEAD",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    {
      name: "Projects Table",
      category: "Database REST",
      method: "HEAD",
      endpoint: "/rest/v1/projects?limit=0",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/projects?limit=0`,
        init: {
          method: "HEAD",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    {
      name: "Conversations Table",
      category: "Database REST",
      method: "HEAD",
      endpoint: "/rest/v1/conversations?limit=0",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/conversations?limit=0`,
        init: {
          method: "HEAD",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    {
      name: "Messages Table",
      category: "Database REST",
      method: "HEAD",
      endpoint: "/rest/v1/messages?limit=0",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/messages?limit=0`,
        init: {
          method: "HEAD",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    {
      name: "User Roles Table",
      category: "Database REST",
      method: "HEAD",
      endpoint: "/rest/v1/user_roles?limit=0",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/user_roles?limit=0`,
        init: {
          method: "HEAD",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    {
      name: "Project Files Table",
      category: "Database REST",
      method: "HEAD",
      endpoint: "/rest/v1/project_files?limit=0",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/project_files?limit=0`,
        init: {
          method: "HEAD",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    {
      name: "Project Snapshots Table",
      category: "Database REST",
      method: "HEAD",
      endpoint: "/rest/v1/project_snapshots?limit=0",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/project_snapshots?limit=0`,
        init: {
          method: "HEAD",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    // RPC
    {
      name: "has_role RPC",
      category: "Database RPC",
      method: "POST",
      endpoint: "/rest/v1/rpc/has_role",
      buildRequest: (b, k, t) => ({
        url: `${b}/rest/v1/rpc/has_role`,
        init: {
          method: "POST",
          headers: {
            apikey: k,
            Authorization: `Bearer ${t}`,
            "Content-Type": "application/json",
            "Content-Profile": "public",
          },
          body: JSON.stringify({ _user_id: "00000000-0000-0000-0000-000000000000", _role: "user" }),
        },
      }),
    },
    // Edge Functions
    {
      name: "aiko-chat",
      category: "Backend Functions",
      method: "OPTIONS",
      endpoint: "/functions/v1/aiko-chat",
      buildRequest: (b) => ({
        url: `${b}/functions/v1/aiko-chat`,
        init: { method: "OPTIONS" },
      }),
    },
    {
      name: "admin-stats",
      category: "Backend Functions",
      method: "OPTIONS",
      endpoint: "/functions/v1/admin-stats",
      buildRequest: (b) => ({
        url: `${b}/functions/v1/admin-stats`,
        init: { method: "OPTIONS" },
      }),
    },
    {
      name: "admin-users",
      category: "Backend Functions",
      method: "OPTIONS",
      endpoint: "/functions/v1/admin-users",
      buildRequest: (b) => ({
        url: `${b}/functions/v1/admin-users`,
        init: { method: "OPTIONS" },
      }),
    },
    {
      name: "admin-manage-role",
      category: "Backend Functions",
      method: "OPTIONS",
      endpoint: "/functions/v1/admin-manage-role",
      buildRequest: (b) => ({
        url: `${b}/functions/v1/admin-manage-role`,
        init: { method: "OPTIONS" },
      }),
    },
    // Storage
    {
      name: "Storage API",
      category: "Storage",
      method: "GET",
      endpoint: "/storage/v1/bucket",
      buildRequest: (b, k, t) => ({
        url: `${b}/storage/v1/bucket`,
        init: {
          method: "GET",
          headers: { apikey: k, Authorization: `Bearer ${t}` },
        },
      }),
    },
    // Realtime
    {
      name: "Realtime Health",
      category: "Realtime",
      method: "GET",
      endpoint: "/realtime/v1/health",
      buildRequest: (b, k) => ({
        url: `${b}/realtime/v1/api/health`,
        init: { method: "GET", headers: { apikey: k } },
      }),
    },
  ];
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Authentication: <Lock className="w-3.5 h-3.5" />,
  "Database REST": <Database className="w-3.5 h-3.5" />,
  "Database RPC": <Server className="w-3.5 h-3.5" />,
  "Backend Functions": <Wifi className="w-3.5 h-3.5" />,
  Storage: <HardDrive className="w-3.5 h-3.5" />,
  Realtime: <Globe className="w-3.5 h-3.5" />,
};

const AdminSystem = () => {
  const { data, isLoading, error } = useAdminStats();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkTimestamp, setCheckTimestamp] = useState<Date | null>(null);

  const runHealthChecks = useCallback(async () => {
    setIsChecking(true);
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    // Get current session token
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token || "";

    const endpoints = buildEndpoints();

    // Set all to pending
    setHealthChecks(
      endpoints.map((ep) => ({
        name: ep.name,
        category: ep.category,
        method: ep.method,
        endpoint: ep.endpoint,
        status: "checking" as const,
      }))
    );

    // Run all checks concurrently
    const results = await Promise.allSettled(
      endpoints.map(async (ep, idx) => {
        const { url, init } = ep.buildRequest(baseUrl, anonKey, token);
        const start = performance.now();
        try {
          const res = await fetch(url, { ...init, signal: AbortSignal.timeout(10000) });
          const latency = Math.round(performance.now() - start);
          return {
            idx,
            result: {
              name: ep.name,
              category: ep.category,
              method: ep.method,
              endpoint: ep.endpoint,
              status: (res.ok || res.status === 204 || res.status === 200) ? "ok" : "error",
              latency,
              statusCode: res.status,
              message: res.ok ? "Healthy" : `HTTP ${res.status}`,
            } as HealthCheck,
          };
        } catch (err) {
          const latency = Math.round(performance.now() - start);
          return {
            idx,
            result: {
              name: ep.name,
              category: ep.category,
              method: ep.method,
              endpoint: ep.endpoint,
              status: "error",
              latency,
              statusCode: 0,
              message: err instanceof Error ? err.message : "Connection failed",
            } as HealthCheck,
          };
        }
      })
    );

    const finalChecks: HealthCheck[] = endpoints.map((ep) => ({
      name: ep.name,
      category: ep.category,
      method: ep.method,
      endpoint: ep.endpoint,
      status: "error",
      latency: 0,
      message: "Unknown",
    }));

    for (const r of results) {
      if (r.status === "fulfilled") {
        finalChecks[r.value.idx] = r.value.result;
      }
    }

    setHealthChecks(finalChecks);
    setCheckTimestamp(new Date());
    setIsChecking(false);
  }, []);

  // Group checks by category
  const groupedChecks = healthChecks.reduce<Record<string, HealthCheck[]>>((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {});

  const totalOk = healthChecks.filter((c) => c.status === "ok").length;
  const totalErr = healthChecks.filter((c) => c.status === "error").length;
  const avgLatency =
    healthChecks.length > 0
      ? Math.round(healthChecks.reduce((s, c) => s + (c.latency || 0), 0) / healthChecks.length)
      : 0;

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load system data: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Health Check */}
      <div className="rounded-xl border border-border/50 p-5 surface-elevated">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Full API Health Report
            </h3>
            {checkTimestamp && (
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last run: {checkTimestamp.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthChecks}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isChecking ? "Scanning..." : "Run Full Check"}
          </Button>
        </div>

        {healthChecks.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border/50 rounded-lg">
            <Activity className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Run a full health check to scan all {buildEndpoints().length} API endpoints across authentication, database, backend functions, storage, and realtime.
            </p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="py-2 px-3 rounded-lg bg-muted/30 text-center">
                <p className="text-[11px] text-muted-foreground uppercase">Healthy</p>
                <p className="text-lg font-bold text-green-500">{totalOk}</p>
              </div>
              <div className="py-2 px-3 rounded-lg bg-muted/30 text-center">
                <p className="text-[11px] text-muted-foreground uppercase">Failed</p>
                <p className="text-lg font-bold text-destructive">{totalErr}</p>
              </div>
              <div className="py-2 px-3 rounded-lg bg-muted/30 text-center">
                <p className="text-[11px] text-muted-foreground uppercase">Avg Latency</p>
                <p className="text-lg font-bold text-foreground">{avgLatency}ms</p>
              </div>
            </div>

            {/* Scrollable results grouped by category */}
            <ScrollArea className="h-[420px] rounded-lg border border-border/30">
              <div className="p-3 space-y-4">
                {Object.entries(groupedChecks).map(([category, checks]) => {
                  const catOk = checks.filter((c) => c.status === "ok").length;
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background/95 backdrop-blur-sm py-1.5 z-10">
                        {CATEGORY_ICONS[category] || <Server className="w-3.5 h-3.5" />}
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {category}
                        </span>
                        <Badge
                          variant={catOk === checks.length ? "default" : "destructive"}
                          className="text-[10px] ml-auto"
                        >
                          {catOk}/{checks.length} ok
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        {checks.map((check) => (
                          <div
                            key={check.name}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                          >
                            {check.status === "checking" ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
                            ) : check.status === "ok" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{check.name}</span>
                                <Badge variant="outline" className="text-[9px] shrink-0 font-mono">
                                  {check.method}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">
                                {check.endpoint}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              {check.statusCode ? (
                                <Badge
                                  variant={check.status === "ok" ? "default" : "destructive"}
                                  className="text-[10px] font-mono"
                                >
                                  {check.statusCode}
                                </Badge>
                              ) : check.status === "checking" ? (
                                <span className="text-[10px] text-muted-foreground">...</span>
                              ) : (
                                <Badge variant="destructive" className="text-[10px]">ERR</Badge>
                              )}
                              {check.latency !== undefined && check.latency > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {check.latency}ms
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Storage */}
        <div className="rounded-xl border border-border/50 p-5 surface-elevated">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4" /> Storage Buckets
          </h3>
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="space-y-2">
              {(data?.storage.buckets || []).map((b) => (
                <div
                  key={b.name}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <span className="text-sm font-mono">{b.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {b.public ? "Public" : "Private"}
                  </Badge>
                </div>
              ))}
              {(data?.storage.buckets || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No buckets found.</p>
              )}
            </div>
          )}
        </div>

        {/* Database Stats */}
        <div className="rounded-xl border border-border/50 p-5 surface-elevated">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4" /> Database Tables
          </h3>
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="space-y-2">
              {Object.entries(data?.tableCounts || {}).map(([table, count]) => (
                <div
                  key={table}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <span className="text-sm font-mono">{table}</span>
                  <span className="text-sm font-medium">{count.toLocaleString()} rows</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform Info */}
      <div className="rounded-xl border border-border/50 p-5 surface-elevated">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4" /> Platform Config
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="py-2 px-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Auth Providers</p>
            <p className="text-sm font-medium">Google, Apple, GitHub</p>
          </div>
          <div className="py-2 px-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Plans</p>
            <p className="text-sm font-medium">Free, Pro, Enterprise</p>
          </div>
          <div className="py-2 px-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Roles</p>
            <p className="text-sm font-medium">User, Moderator, Admin</p>
          </div>
          <div className="py-2 px-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">API Endpoints</p>
            <p className="text-sm font-medium">{buildEndpoints().length} monitored</p>
          </div>
          <div className="py-2 px-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Framework</p>
            <p className="text-sm font-medium">React + Vite</p>
          </div>
          <div className="py-2 px-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Roles (Active)</p>
            <p className="text-sm font-medium">
              {isLoading
                ? "..."
                : Object.entries(data?.roles || {})
                    .map(([r, c]) => `${c} ${r}`)
                    .join(", ") || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystem;
