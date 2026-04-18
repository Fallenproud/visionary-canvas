import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-atmosphere relative overflow-hidden px-6">
      <div className="aurora" />
      <div className="noise-grain" />
      <div className="text-center relative z-10 space-y-6">
        <div className="flex justify-center mb-4">
          <Logo withWordmark={false} size={56} />
        </div>
        <h1 className="text-7xl font-bold gradient-text number-glow">404</h1>
        <p className="text-xl text-muted-foreground">This page drifted into the aurora.</p>
        <Button onClick={() => navigate("/")} size="lg">
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
