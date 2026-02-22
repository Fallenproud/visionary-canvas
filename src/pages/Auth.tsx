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
import { Chrome, Github } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

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
              <Button variant="outline" className="w-full relative" disabled>
                <Chrome className="w-4 h-4 mr-2" /> Continue with Google
                <span className="absolute right-3 text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Soon</span>
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
