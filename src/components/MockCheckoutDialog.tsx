import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MockCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  price: string;
  period: string;
}

export const MockCheckoutDialog = ({
  open,
  onOpenChange,
  planName,
  price,
  period,
}: MockCheckoutDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) e.card = "Enter 16 digits";
    const parts = expiry.split("/");
    if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
      e.expiry = "Use MM/YY format";
    } else {
      const m = parseInt(parts[0]);
      if (m < 1 || m > 12) e.expiry = "Invalid month";
    }
    if (cvc.replace(/\D/g, "").length !== 3) e.cvc = "Enter 3 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate() || !user) return;
    setProcessing(true);
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2000));
    const { error } = await supabase
      .from("profiles")
      .update({ plan: planName.toLowerCase() })
      .eq("id", user.id);
    setProcessing(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setSuccess(true);
    toast({ title: "Plan updated!", description: `You're now on the ${planName} plan.` });
    setTimeout(() => {
      setSuccess(false);
      setCardNumber("");
      setExpiry("");
      setCvc("");
      onOpenChange(false);
    }, 1500);
  };

  const handleClose = (val: boolean) => {
    if (!processing) {
      setSuccess(false);
      setCardNumber("");
      setExpiry("");
      setCvc("");
      setErrors({});
      onOpenChange(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Checkout</DialogTitle>
            <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
              Test Mode
            </Badge>
          </div>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-semibold text-lg">Payment Successful!</p>
            <p className="text-sm text-muted-foreground">Your plan has been updated.</p>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {/* Plan summary */}
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{planName} Plan</p>
                <p className="text-sm text-muted-foreground">{period}</p>
              </div>
              <p className="text-2xl font-bold">{price}</p>
            </div>

            {/* Card form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCard(e.target.value))}
                    className="pl-10"
                  />
                </div>
                {errors.card && <p className="text-xs text-destructive mt-1">{errors.card}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Expiry</label>
                  <Input
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  />
                  {errors.expiry && <p className="text-xs text-destructive mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">CVC</label>
                  <Input
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  />
                  {errors.cvc && <p className="text-xs text-destructive mt-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handlePay} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" /> Pay {price}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This is a test checkout. No real charges will be made.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
