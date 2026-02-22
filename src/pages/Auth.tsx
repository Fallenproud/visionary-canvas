import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Github } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { lovable } from "@/integrations/lovable/index";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(100),
});

type AuthFormData = z.infer<typeof authSchema>;

const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
};

const Auth = () => {
  usePageTitle("Sign In");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const watchedPassword = watch("password", "");
  const strength = useMemo(() => getPasswordStrength(watchedPassword), [watchedPassword]);

  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: "Check your email to confirm your account." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You've been signed in successfully." });
        navigate("/dashboard");
      }
      reset();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email sent", description: "Check your email for a password reset link." });
      setShowForgot(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="surface-elevated rounded-2xl p-8 border border-border/50">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{isSignUp ? "Create an account" : "Welcome back"}</h1>
              <p className="text-muted-foreground">{isSignUp ? "Start building with AIKO today" : "Sign in to your account to continue"}</p>
            </div>

            {/* Social Login Placeholders */}
            <div className="space-y-2 mb-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full relative" disabled>
                <Github className="w-4 h-4 mr-2" /> Continue with GitHub
                <span className="absolute right-3 text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Soon</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {showForgot ? (
              <div className="space-y-4">
                <Input type="email" placeholder="Email address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                <Button className="w-full" onClick={handleForgotPassword}>Send Reset Link</Button>
                <button onClick={() => setShowForgot(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center">
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input type="email" placeholder="Email address" {...register("email")} className={errors.email ? "border-destructive" : ""} />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Input type="password" placeholder="Password" {...register("password")} className={errors.password ? "border-destructive" : ""} />
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                    {/* Password strength */}
                    {isSignUp && watchedPassword.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= strength.score ? strength.color : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{strength.label}</p>
                      </div>
                    )}
                  </div>

                  {!isSignUp && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                        <Checkbox id="remember" />
                        <span>Remember me</span>
                      </label>
                      <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <button onClick={() => { setIsSignUp(!isSignUp); reset(); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </button>
                </div>
              </>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
