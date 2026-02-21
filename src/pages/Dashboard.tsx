import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Plus, FolderOpen, Trash2, LogOut, Settings, Smartphone, Clock,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [template, setTemplate] = useState("blank");

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
        <div className="flex items-center justify-between mb-10">
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
                <Input
                  placeholder="Project name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
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
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface-elevated rounded-xl border border-border/50 p-5 hover:border-muted-foreground/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold truncate">{project.name}</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
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
                      onClick={(e) => { e.stopPropagation(); deleteProject.mutate(project.id); }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/playground/${project.id}`)}>
                      <FolderOpen className="w-4 h-4 mr-1" /> Open
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
