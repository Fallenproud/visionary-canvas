import { useState, useCallback } from "react";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Database,
  HardDrive,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";

interface HealthCheck {
  name: string;
  status: "ok" | "error" | "checking";
  latency?: number;
}

const EDGE_FUNCTIONS = [
  "aiko-chat",
  "admin-stats",
  "admin-users",
  "admin-manage-role",
];

const AdminSystem = () => {
  const { data, isLoading, error } = useAdminStats();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runHealthChecks = useCallback(async () => {
    setIsChecking(true);
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const checks: HealthCheck[] = [];

    for (const fn of EDGE_FUNCTIONS) {
      const start = performance.now();
      try {
        const res = await fetch(`${baseUrl}/functions/v1/${fn}`, {
          method: "OPTIONS",
        });
        const latency = Math.round(performance.now() - start);
        checks.push({
          name: fn,
          status: res.ok || res.status === 204 ? "ok" : "error",
          latency,
        });
      } catch {
        checks.push({ name: fn, status: "error", latency: 0 });
      }
    }

    setHealthChecks(checks);
    setIsChecking(false);
  }, []);

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load system data: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Checks */}
      <div className="rounded-xl border border-border/50 p-5 surface-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" /> API Health
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthChecks}
            disabled={isChecking}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Checking..." : "Run Check"}
          </Button>
        </div>

        {healthChecks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click "Run Check" to test backend function endpoints.
          </p>
        ) : (
          <div className="space-y-2">
            {healthChecks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      check.status === "ok" ? "bg-green-400" : "bg-destructive"
                    }`}
                  />
                  <span className="text-sm font-mono">{check.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {check.latency}ms
                </span>
              </div>
            ))}
          </div>
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
            <p className="text-xs text-muted-foreground">Backend Functions</p>
            <p className="text-sm font-medium">{EDGE_FUNCTIONS.length} deployed</p>
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
