import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Upload, Trash2, Volume2, VolumeX, Key, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { usePageTitle } from "@/hooks/usePageTitle";

const Settings = () => {
  usePageTitle("Settings");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [plan, setPlan] = useState("free");
  const [saving, setSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("aiko-sound") !== "false");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, plan, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setPlan(data.plan);
          setAvatarUrl(data.avatar_url);
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Profile updated successfully." });
    }
  };

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("aiko-sound", String(enabled));
  };

  const initials = (displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold">Settings</h1>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Profile Section */}
        <div className="surface-elevated rounded-xl border border-border/50 p-6 space-y-6">
          <h2 className="text-lg font-semibold">Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Profile picture</p>
              <Button variant="outline" size="sm" disabled>
                <Upload className="w-3 h-3 mr-1" /> Upload (coming soon)
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Plan */}
        <div className="surface-elevated rounded-xl border border-border/50 p-6">
          <h2 className="text-lg font-semibold mb-2">Plan</h2>
          <p className="text-muted-foreground text-sm">
            Current plan: <span className="capitalize font-medium text-foreground">{plan}</span>
          </p>
        </div>

        {/* Preferences */}
        <div className="surface-elevated rounded-xl border border-border/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Preferences</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-muted-foreground" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">Completion Sound</p>
                <p className="text-xs text-muted-foreground">Play a sound when AI finishes generating</p>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
          </div>
        </div>

        {/* API Keys (placeholder) */}
        <div className="surface-elevated rounded-xl border border-border/50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">API Keys</h2>
          </div>
          <p className="text-sm text-muted-foreground">Manage API keys for third-party integrations.</p>
          <Button variant="outline" size="sm" disabled>Coming soon</Button>
        </div>

        {/* Appearance (placeholder) */}
        <div className="surface-elevated rounded-xl border border-border/50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          <p className="text-sm text-muted-foreground">Customize your AIKO experience.</p>
          <Button variant="outline" size="sm" disabled>Coming soon</Button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-destructive/30 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. All your projects and data will be permanently removed.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Account"
        description="This will permanently delete your account and all associated projects, files, and data. This action cannot be undone."
        confirmLabel="Delete My Account"
        destructive
        onConfirm={async () => {
          toast({ title: "Not available", description: "Account deletion is not yet enabled. Contact support." });
          setDeleteOpen(false);
        }}
      />
    </div>
  );
};

export default Settings;
