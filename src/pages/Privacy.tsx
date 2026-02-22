import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

const Privacy = () => {
  usePageTitle("Privacy Policy");

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, and account credentials when you create an account. We also collect usage data to improve our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure security of your account and projects.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Services</h2>
            <p>We may use third-party services for analytics and infrastructure. These services have their own privacy policies governing how they use your information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time. You can manage your account settings or contact us for assistance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aiko.dev" className="text-accent hover:underline">privacy@aiko.dev</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
