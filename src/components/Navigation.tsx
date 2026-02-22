import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Features", action: () => scrollToSection("features") },
    { label: "Pricing", action: () => scrollToSection("pricing") },
    { label: "About", action: () => { setMobileOpen(false); navigate("/about"); } },
    { label: "Contact", action: () => scrollToSection("contact") },
  ];

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-transparent" style={{ borderImage: 'linear-gradient(90deg, transparent, hsl(217 91% 60% / 0.2), transparent) 1' }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center transition-shadow group-hover:shadow-[0_0_20px_-3px_hsl(217_91%_60%_/_0.5)]">
              <span className="text-accent-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">AIKO</span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            {!loading && !user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}

            {!loading && user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center justify-center rounded-full ring-2 ring-border hover:ring-accent transition-all">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-semibold bg-accent text-accent-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t border-border/50 mt-4">
                {!loading && !user && (
                  <Button className="w-full" onClick={() => { setMobileOpen(false); navigate("/auth"); }}>
                    Get Started
                  </Button>
                )}
                {!loading && user && (
                  <div className="space-y-1">
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/settings"); }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      Settings
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { setMobileOpen(false); navigate("/admin"); }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
