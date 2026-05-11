import { Users, FolderKanban, Activity, Database } from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  tab: string;
  icon: typeof Users;
  accent: string;
}

const actions: QuickAction[] = [
  { label: "Manage Users", description: "Roles, plans, search", tab: "users", icon: Users, accent: "from-blue-500/20 to-cyan-500/10" },
  { label: "Inspect Projects", description: "Status & owners", tab: "projects", icon: FolderKanban, accent: "from-purple-500/20 to-pink-500/10" },
  { label: "Run Health Check", description: "All API endpoints", tab: "system", icon: Activity, accent: "from-green-500/20 to-emerald-500/10" },
  { label: "Backend Status", description: "DB · Auth · Storage", tab: "system", icon: Database, accent: "from-orange-500/20 to-amber-500/10" },
];

interface AdminQuickActionsProps {
  onNavigate: (tab: string) => void;
}

const AdminQuickActions = ({ onNavigate }: AdminQuickActionsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => onNavigate(a.tab)}
          className="group relative text-left rounded-xl border border-border/50 p-4 surface-elevated overflow-hidden hover:border-accent/40 transition-all hover:-translate-y-0.5"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${a.accent} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`}
          />
          <div className="relative flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background/60 border border-border/50 group-hover:border-accent/40 transition-colors">
              <a.icon className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{a.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default AdminQuickActions;
