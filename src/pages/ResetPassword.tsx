import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const handleReset = async () => {
    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      navigate("/auth");
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-atmosphere relative">
        <div className="aurora" aria-hidden="true" />
        <div className="noise-grain" aria-hidden="true" />
        <div className="relative z-10 text-center">
          <h1 className="text-xl font-semibold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-4">This password reset link is invalid or expired.</p>
          <Button onClick={() => navigate("/auth")}>Back to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-atmosphere relative">
      <div className="aurora" aria-hidden="true" />
      <div className="noise-grain" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md glass rounded-2xl p-8 border border-border/50 conic-border"
      >
        <h1 className="text-2xl font-bold mb-2 text-center gradient-text">Set New Password</h1>
        <p className="text-muted-foreground text-center mb-6 text-sm">Enter your new password below</p>
        <div className="space-y-4">
          <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <Button className="w-full" onClick={handleReset} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
