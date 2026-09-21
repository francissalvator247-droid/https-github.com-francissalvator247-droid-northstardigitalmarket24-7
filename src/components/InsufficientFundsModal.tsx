import { motion } from "framer-motion";
import { AlertTriangle, ArrowDownToLine, X, Wallet, ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsufficientFundsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenDeposit: (planName: string, requiredUsd: number) => void;
  planName: string;
  planAmount: number;
  cashBalance: number;
}

const BTC_USD_PRICE = 67452.18;

export function InsufficientFundsModal({
  open,
  onClose,
  onOpenDeposit,
  planName,
  planAmount,
  cashBalance,
}: InsufficientFundsModalProps) {
  if (!open) return null;

  const shortfall = Math.max(0, planAmount - cashBalance);
  const shortfallBtc = (shortfall / BTC_USD_PRICE).toFixed(5);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-destructive/40 bg-card shadow-2xl overflow-hidden relative"
      >
        {/* Top Warning Banner */}
        <div className="bg-destructive/10 border-b border-destructive/20 p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-destructive/20 text-destructive grid place-items-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Insufficient Cash Balance</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Capital must be funded from your cash balance before activation
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            All visitor trading and investment strategies are deployed directly from your{" "}
            <strong className="text-foreground">liquid cash balance</strong>. Your current balance
            does not have enough funds to activate the{" "}
            <span className="text-foreground font-semibold">{planName}</span> plan.
          </p>

          {/* Balance breakdown card */}
          <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                Available Cash Balance:
              </span>
              <span className="font-mono font-bold text-foreground">
                $
                {cashBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Required for {planName} Plan:</span>
              <span className="font-mono font-bold text-foreground">
                $
                {planAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="pt-2 border-t border-border/80 flex justify-between items-center text-xs">
              <span className="font-semibold text-destructive flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Shortfall Needed:
              </span>
              <div className="text-right font-mono font-extrabold text-destructive">
                <div>${shortfall.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="text-[10px] text-muted-foreground">≈ {shortfallBtc} BTC</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <Button
              onClick={() => {
                onClose();
                onOpenDeposit(planName, shortfall);
              }}
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-2xl py-6 text-sm"
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Deposit BTC to Fund Balance
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full py-5 rounded-xl text-xs">
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
