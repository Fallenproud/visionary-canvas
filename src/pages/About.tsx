import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Users, Target, Heart, Award } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const values = [
  {
    icon: Users,
    title: "User-Centric",
    description: "Every decision we make puts our users first",
  },
  {
    icon: Target,
    title: "Innovation",
    description: "Pushing boundaries in AI-powered design",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "We love what we do and it shows in our product",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Committed to delivering the highest quality",
  },
];

const About = () => {
  usePageTitle("About");
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About AIKO
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're on a mission to democratize professional design through
              intelligent AI assistance, empowering creators worldwide to bring
              their visions to life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6 text-lg text-muted-foreground leading-relaxed"
          >
            <p>
              Founded in 2023, AIKO started with a simple observation: designers
              spend countless hours on repetitive tasks that could be automated,
              leaving less time for true creativity.
            </p>
            <p>
              Our team of designers, engineers, and AI researchers came together
              to build a tool that amplifies human creativity rather than
              replacing it. The result is AIKO - an AI-powered design assistant
              that handles the tedious work while you focus on what matters: creating
              exceptional designs.
            </p>
            <p>
              Today, AIKO is trusted by over 2,000 designers worldwide, from
              freelancers to Fortune 500 companies. But we're just getting started.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
