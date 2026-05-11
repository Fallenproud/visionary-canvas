import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, LayoutDashboard, Users, FolderKanban, Settings2 } from "lucide-react";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminSystem from "@/components/admin/AdminSystem";

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!user) return;
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Shield className="w-4 h-4 text-accent" />
          <h1 className="font-semibold">Admin Panel</h1>
          <span className="ml-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-dot-pulse" />
            Live
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6 relative">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-1.5 text-xs data-[state=active]:shadow-[0_0_20px_-5px_hsl(217_91%_60%/0.5)]">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs data-[state=active]:shadow-[0_0_20px_-5px_hsl(217_91%_60%/0.5)]">
              <Users className="w-3.5 h-3.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5 text-xs data-[state=active]:shadow-[0_0_20px_-5px_hsl(217_91%_60%/0.5)]">
              <FolderKanban className="w-3.5 h-3.5" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-1.5 text-xs data-[state=active]:shadow-[0_0_20px_-5px_hsl(217_91%_60%/0.5)]">
              <Settings2 className="w-3.5 h-3.5" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview onNavigate={setTab} />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
          <TabsContent value="projects">
            <AdminProjects />
          </TabsContent>
          <TabsContent value="system">
            <AdminSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
