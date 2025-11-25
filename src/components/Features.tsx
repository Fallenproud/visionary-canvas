import { Zap, Layers, Lock, Sparkles } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Design",
    description: "Leverage cutting-edge AI to accelerate your creative process and generate stunning designs in seconds.",
  },
  {
    icon: Layers,
    title: "Layered Workflow",
    description: "Organize your projects with intuitive layer management and collaborative design systems.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Experience real-time rendering and instant feedback with our optimized performance engine.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Your designs are protected with bank-level encryption and advanced security protocols.",
  },
];

export const Features = () => {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need
            <br />
            <span className="text-muted-foreground">to design better</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built from the ground up to help designers work faster, smarter, and more collaboratively.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative surface-elevated rounded-2xl p-8 border border-border/50 hover:border-border transition-all duration-300"
            >
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 glow-accent-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
