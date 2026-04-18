import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

const Terms = () => {
  usePageTitle("Terms of Service");

  return (
    <div className="min-h-screen bg-atmosphere relative overflow-hidden">
      <div className="aurora opacity-50" />
      <Navigation />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using AIKO, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>AIKO provides AI-powered design and development tools. We reserve the right to modify, suspend, or discontinue any part of the service at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must not share your account with others or use another person's account without permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Intellectual Property</h2>
            <p>You retain ownership of all content you create using AIKO. We do not claim any intellectual property rights over the projects and code you generate.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p>You agree not to use AIKO for any unlawful purpose or in any way that could damage, disable, or impair our services. Abuse of AI features may result in account suspension.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
            <p>AIKO is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@aiko.dev" className="text-accent hover:underline">legal@aiko.dev</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
