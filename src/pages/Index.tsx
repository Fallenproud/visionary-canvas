import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Demo } from "@/components/Demo";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

const Index = () => {
  usePageTitle("Imagine with AI Design Tools");
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Stats />
      <div id="features">
        <Features />
      </div>
      <Demo />
      <div id="pricing">
        <Pricing />
      </div>
      <div id="contact">
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
