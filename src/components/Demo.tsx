import { motion } from "framer-motion";
import { Sparkles, Layers, Zap, Wand2 } from "lucide-react";
import { useState } from "react";

const demoFeatures = [
  {
    icon: Sparkles,
    title: "AI Generation",
    description: "Watch AI create stunning designs in real-time",
    color: "from-accent to-accent/60",
  },
  {
    icon: Layers,
    title: "Layer Management",
    description: "Organize complex projects with ease",
    color: "from-accent/80 to-accent/40",
  },
  {
    icon: Zap,
    title: "Instant Export",
    description: "Export in any format with one click",
    color: "from-accent/60 to-accent/30",
  },
  {
    icon: Wand2,
    title: "Smart Tools",
    description: "Intelligent tools that understand your intent",
    color: "from-accent/90 to-accent/50",
  },
];

export const Demo = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See it in action
            <br />
            <span className="gradient-text">Interactive demo</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Experience the power of AIKO with our interactive demonstration
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {demoFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeFeature === index
                    ? "surface-elevated border border-accent/40 shadow-lg shadow-accent/5"
                    : "bg-secondary/20 border border-transparent hover:border-border/50 hover:bg-secondary/30"
                }`}
                onClick={() => setActiveFeature(index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <feature.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative surface-elevated rounded-2xl p-8 border border-border/50 aspect-square flex items-center justify-center overflow-hidden">
              {/* Animated gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/3" />

              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center relative z-10"
              >
                <div
                  className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${demoFeatures[activeFeature].color} flex items-center justify-center shadow-xl shadow-accent/10`}
                >
                  {(() => {
                    const Icon = demoFeatures[activeFeature].icon;
                    return <Icon className="w-12 h-12 text-accent-foreground" />;
                  })()}
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {demoFeatures[activeFeature].title}
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {demoFeatures[activeFeature].description}
                </p>
              </motion.div>

              {/* Animated ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-accent/10 animate-spin-slow" />
                <div className="absolute w-48 h-48 rounded-full border border-accent/5 animate-spin-slow" style={{ animationDirection: "reverse" }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
