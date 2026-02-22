import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "aiko-cookie-consent";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="surface-elevated rounded-2xl border border-border/50 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-4.5 h-4.5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">We use cookies</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  We use cookies to enhance your experience. By continuing to use AIKO, you agree to our{" "}
                  <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAccept} className="text-xs h-8">
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDecline} className="text-xs h-8">
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
