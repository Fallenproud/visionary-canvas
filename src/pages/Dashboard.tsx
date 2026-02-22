import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Plus, FolderOpen, Trash2, LogOut, Settings, Smartphone, Clock, Search,
  ArrowUpDown, Shield,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useIsAdmin } from "@/hooks/useIsAdmin";

type SortKey = "updated" | "name" | "status";

const Dashboard = () => {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const { isAdmin } = useIsAdmin();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [template, setTemplate] = useState("blank");

  // Search + sort
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("updated");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    if (!projects) return [];
    let list = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    return list;
  }, [projects, search, sortBy]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const project = await createProject.mutateAsync({
      name: newName,
      description: newDesc,
      framework: "expo",
      template,
    });
    setWizardOpen(false);
    setNewName("");
    setNewDesc("");
    navigate(`/playground/${project.id}`);
  };

  // Generate a deterministic gradient from project name
  const gradientFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 60%, 30%), hsl(${h2}, 50%, 20%))`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-lg">AIKO</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} title="Admin Panel">
                <Shield className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <p className="text-muted-foreground mt-1">Build mobile apps with AIKO</p>
          </div>
          <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Project name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                <div>
                  <p className="text-sm font-medium mb-2">Template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "blank", label: "Blank", desc: "Empty starter" },
                      { id: "tabs", label: "Tab Navigation", desc: "Bottom tabs" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          template === t.id
                            ? "border-primary bg-secondary"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <p className="text-sm font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={createProject.isPending}>
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search + Sort bar */}
        {projects && projects.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Smartphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6">Create your first mobile app with AIKO</p>
            <Button onClick={() => setWizardOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Project
            </Button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No projects match "{search}"</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface-elevated rounded-xl border border-border/50 overflow-hidden hover:border-muted-foreground/30 transition-colors group"
              >
                {/* Gradient thumbnail */}
                <div
                  className="h-24 flex items-center justify-center"
                  style={{ background: gradientFromName(project.name) }}
                >
                  <Smartphone className="w-8 h-8 text-white/30" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize shrink-0 ml-2">
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: project.id, name: project.name });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <Button size="sm" onClick={() => navigate(`/playground/${project.id}`)}>
                        <FolderOpen className="w-4 h-4 mr-1" /> Open
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and all project files will be permanently removed.`}
        confirmLabel="Delete Project"
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            deleteProject.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
