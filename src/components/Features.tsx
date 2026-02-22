import { Zap, Layers, Lock, Sparkles, Eye, GitBranch, Bot, LayoutTemplate } from "lucide-react";
import { motion } from "framer-motion";

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
  {
    icon: Eye,
    title: "Real-time Preview",
    description: "See your changes instantly with live preview that mirrors production output perfectly.",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Track every change with built-in versioning. Revert, compare, and branch freely.",
  },
  {
    icon: Bot,
    title: "Multi-Agent AI",
    description: "Specialized AI agents collaborate on different aspects of your project simultaneously.",
  },
  {
    icon: LayoutTemplate,
    title: "Template Library",
    description: "Jumpstart projects with professionally designed templates for every use case.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export const Features = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh" />

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
            Everything you need
            <br />
            <span className="gradient-text">to design better</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built from the ground up to help designers work faster, smarter, and more collaboratively.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group relative surface-elevated rounded-2xl p-7 border border-border/50 hover:border-accent/30 transition-all duration-500 feature-tilt"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/5 to-transparent" />

              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>

                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
