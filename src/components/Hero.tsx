import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroPhone from "@/assets/hero-phone-mockup.png";
import { motion } from "framer-motion";
import { useState } from "react";
import { VideoModal } from "./VideoModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Hero = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      <VideoModal open={isVideoOpen} onOpenChange={setIsVideoOpen} />

      {/* Aurora atmospheric blobs */}
      <div className="aurora" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Spotlight radial */}
      <div className="absolute inset-0 spotlight" />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-mesh" />

      {/* Noise grain */}
      <div className="noise-grain" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <span className="shimmer-badge px-4 py-2 rounded-full glass text-sm font-medium border border-accent/20 text-accent">
                ✦ Now in Beta
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Imagine
              <br />
              <span className="gradient-text">with AIKO</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Transform your creative workflow with intelligent design assistance.
              Built for designers who demand perfection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="group text-base px-8" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
                {user ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" onClick={() => setIsVideoOpen(true)}>
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 justify-center lg:justify-start text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["217 91% 60%", "271 81% 56%", "142 71% 45%", "32 95% 60%"].map((hsl, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background"
                      style={{ background: `linear-gradient(135deg, hsl(${hsl}), hsl(${hsl} / 0.6))` }}
                    />
                  ))}
                </div>
                <span>2,000+ designers</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-accent">★ 4.9/5 rating</span>
            </div>
          </motion.div>

          {/* Right content - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <div className="relative animate-float">
              {/* Outer glow ring */}
              <div className="absolute -inset-8 rounded-[4rem] bg-gradient-to-br from-accent/20 via-transparent to-accent/10 blur-2xl" />

              {/* Inner glow */}
              <div className="absolute inset-0 glow-accent rounded-[3rem] blur-3xl opacity-50" />

              {/* Phone container */}
              <div className="relative surface-elevated p-3 rounded-[3rem] border border-border/50 shadow-2xl shadow-accent/5">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-background">
                  <img
                    src={heroPhone}
                    alt="AIKO App Interface"
                    className="w-full h-auto max-w-[320px] md:max-w-[380px]"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
