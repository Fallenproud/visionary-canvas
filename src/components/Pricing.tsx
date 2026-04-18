import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MockCheckoutDialog } from "@/components/MockCheckoutDialog";

const plans = [
  {
    name: "Free",
    priceMonthly: "$0",
    priceAnnual: "$0",
    period: "forever",
    description: "Perfect for trying out AIKO",
    features: [
      "5 projects",
      "Basic AI assistance",
      "Community support",
      "Export to PNG/JPG",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    priceMonthly: "$29",
    priceAnnual: "$24",
    period: "per month",
    description: "For professional designers",
    features: [
      "Unlimited projects",
      "Advanced AI features",
      "Priority support",
      "All export formats",
      "Team collaboration",
      "Version history",
      "Custom templates",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    priceMonthly: "Custom",
    priceAnnual: "Custom",
    period: "contact us",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SSO & advanced security",
      "Unlimited team members",
      "SLA guarantee",
      "Custom training",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const handleCTA = (plan: typeof plans[0]) => {
    if (plan.name === "Enterprise") {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (plan.name === "Free") {
      if (!user) navigate("/auth");
      else navigate("/dashboard");
      return;
    }
    if (!user) {
      navigate("/auth");
      return;
    }
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  return (
    <section id="pricing" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple,
            <br />
            <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        {/* Annual/Monthly toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? "bg-accent" : "bg-secondary"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${isAnnual ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual <span className="text-accent text-xs ml-1">Save 17%</span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: plan.highlighted ? 1.03 : 1.01 }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 200, damping: 22 }}
              className={`relative surface-elevated rounded-2xl p-8 border transition-all duration-300 conic-border ${
                plan.highlighted
                  ? "border-accent/50 animate-pulse-glow scale-[1.02]"
                  : "border-border/50 hover:border-border"
              }`}
              data-active={plan.highlighted ? "true" : undefined}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="shimmer-badge px-4 py-1.5 rounded-full bg-gradient-to-r from-accent to-[hsl(var(--gradient-mid))] text-accent-foreground text-xs font-semibold tracking-wide uppercase shadow-lg shadow-accent/30">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">
                    {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <Button
                className="w-full mb-8"
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                onClick={() => handleCTA(plan)}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <MockCheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          planName={selectedPlan.name}
          price={isAnnual ? selectedPlan.priceAnnual : selectedPlan.priceMonthly}
          period={selectedPlan.period}
        />
      )}
    </section>
  );
};
