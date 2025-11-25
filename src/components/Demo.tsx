import { motion } from "framer-motion";
import { Sparkles, Layers, Zap, Wand2 } from "lucide-react";
import { useState } from "react";

const demoFeatures = [
  {
    icon: Sparkles,
    title: "AI Generation",
    description: "Watch AI create stunning designs in real-time",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Layers,
    title: "Layer Management",
    description: "Organize complex projects with ease",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Instant Export",
    description: "Export in any format with one click",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Wand2,
    title: "Smart Tools",
    description: "Intelligent tools that understand your intent",
    color: "from-green-500 to-emerald-500",
  },
];

export const Demo = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface-subtle to-background" />

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
            <span className="text-muted-foreground">Interactive demo</span>
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
                    ? "surface-elevated border border-accent/50 glow-accent-sm"
                    : "bg-secondary/30 border border-transparent hover:border-border/50"
                }`}
                onClick={() => setActiveFeature(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
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
            <div className="relative surface-elevated rounded-2xl p-8 border border-border/50 aspect-square flex items-center justify-center">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div
                  className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${demoFeatures[activeFeature].color} flex items-center justify-center`}
                >
                  {(() => {
                    const Icon = demoFeatures[activeFeature].icon;
                    return <Icon className="w-12 h-12 text-white" />;
                  })()}
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {demoFeatures[activeFeature].title}
                </h3>
                <p className="text-muted-foreground">
                  {demoFeatures[activeFeature].description}
                </p>
              </motion.div>

              {/* Animated circles */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              >
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br ${demoFeatures[activeFeature].color} opacity-10 blur-2xl`}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
