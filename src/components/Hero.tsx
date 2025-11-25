import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroPhone from "@/assets/hero-phone-mockup.png";
import { motion } from "framer-motion";
import { useState } from "react";
import { VideoModal } from "./VideoModal";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      <VideoModal open={isVideoOpen} onOpenChange={setIsVideoOpen} />
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-subtle via-background to-background" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full surface-elevated text-sm font-medium border border-border">
                Now in Beta
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Imagine
              <br />
              <span className="text-muted-foreground">with AIKO</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Transform your creative workflow with intelligent design assistance. 
              Built for designers who demand perfection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="group" onClick={() => navigate("/auth")}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setIsVideoOpen(true)}>
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 justify-center lg:justify-start text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full bg-secondary border-2 border-background"
                    />
                  ))}
                </div>
                <span>2,000+ designers</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span>★ 4.9/5 rating</span>
            </div>
          </motion.div>

          {/* Right content - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 glow-accent rounded-[3rem] blur-3xl opacity-40" />
              
              {/* Phone container */}
              <div className="relative surface-elevated p-3 rounded-[3rem] border border-border/50">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-background">
                  <img 
                    src={heroPhone} 
                    alt="AIKO App Interface"
                    className="w-full h-auto max-w-[320px] md:max-w-[380px]"
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
