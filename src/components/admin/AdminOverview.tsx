import { useAdminStats } from "@/hooks/useAdminStats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FolderKanban,
  MessageSquare,
  Mail,
  TrendingUp,
  Clock,
} from "lucide-react";
import AdminActivityFeed from "./AdminActivityFeed";
import AdminQuickActions from "./AdminQuickActions";

interface AdminOverviewProps {
  onNavigate?: (tab: string) => void;
}

const AdminOverview = ({ onNavigate }: AdminOverviewProps) => {
  const { data, isLoading, error } = useAdminStats();

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load stats: {error.message}
      </div>
    );
  }

  const kpis = data
    ? [
        { label: "Total Users", value: data.users.total, icon: Users },
        { label: "Total Projects", value: data.projects.total, icon: FolderKanban },
        { label: "Conversations", value: data.conversations.total, icon: MessageSquare },
        { label: "Messages", value: data.messages.total, icon: Mail },
        { label: "New Users (7d)", value: data.users.last7d, icon: TrendingUp },
        { label: "New Projects (7d)", value: data.projects.last7d, icon: TrendingUp },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <AdminQuickActions onNavigate={(tab) => onNavigate?.(tab)} />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 p-4 surface-elevated">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))
          : kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="relative rounded-xl border border-border/50 p-4 surface-elevated overflow-hidden group hover:border-accent/30 transition-colors"
              >
                {/* Gradient accent corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent/15 via-transparent to-transparent rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <kpi.icon className="w-3.5 h-3.5 text-accent" />
                    <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                  </div>
                  <p className="text-2xl font-bold gradient-text">{kpi.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <div className="rounded-xl border border-border/50 p-5 surface-elevated">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Plan Distribution
            </h3>
            <div className="space-y-2">
              {Object.entries(data.users.byPlan).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{plan}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{
                          width: `${Math.max(4, (count / data.users.total) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Status */}
          <div className="rounded-xl border border-border/50 p-5 surface-elevated">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Project Status
            </h3>
            <div className="space-y-2">
              {Object.entries(data.projects.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{status}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="rounded-xl border border-border/50 p-5 surface-elevated">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Signups
            </h3>
            <div className="space-y-2">
              {data.recentUsers.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="truncate flex-1 mr-3">
                    <span className="font-medium">{u.display_name || "—"}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{u.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="rounded-xl border border-border/50 p-5 surface-elevated">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Projects
            </h3>
            <div className="space-y-2">
              {data.recentProjects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="truncate flex-1 mr-3">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      by {p.owner_name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap capitalize">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
