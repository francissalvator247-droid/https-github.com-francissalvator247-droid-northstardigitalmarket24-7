import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  QrCode,
  ArrowDownToLine,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Clock,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BTC_RECIPIENT_ADDRESS } from "@/config/wallet";
import { supabase } from "@/integrations/supabase/client";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onDepositSubmitted?: () => void;
  initialBtcAmount?: string;
  initialUsdAmount?: number;
  planName?: string;
}

const BTC_USD_PRICE = 67452.18;

export function DepositModal({
  open,
  onClose,
  onDepositSubmitted,
  initialBtcAmount,
  initialUsdAmount,
  planName,
}: DepositModalProps) {
  const [btcAmount, setBtcAmount] = useState<string>(() => {
    if (initialBtcAmount) return initialBtcAmount;
    if (initialUsdAmount) return (initialUsdAmount / BTC_USD_PRICE).toFixed(5);
    return "0.05";
  });
  const [hasDeposited, setHasDeposited] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update btc amount if props change
  useEffect(() => {
    if (initialBtcAmount) {
      setBtcAmount(initialBtcAmount);
    } else if (initialUsdAmount) {
      setBtcAmount((initialUsdAmount / BTC_USD_PRICE).toFixed(5));
    }
  }, [initialBtcAmount, initialUsdAmount]);

  const numBtc = parseFloat(btcAmount) || 0;
  const usdValue = numBtc * BTC_USD_PRICE;

  // Generate QR code for the recipient wallet address and requested BTC
  useEffect(() => {
    if (!open) return;
    const btcUri =
      numBtc > 0
        ? `bitcoin:${BTC_RECIPIENT_ADDRESS}?amount=${numBtc.toFixed(8)}`
        : `bitcoin:${BTC_RECIPIENT_ADDRESS}`;

    QRCode.toDataURL(btcUri, {
      width: 280,
      margin: 2,
      color: {
        dark: "#05070a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Failed to generate QR code", err));
  }, [open, numBtc]);

  const handleCopy = () => {
    navigator.clipboard.writeText(BTC_RECIPIENT_ADDRESS).then(() => {
      setCopied(true);
      toast.success("Recipient wallet address copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleDepositClick = () => {
    if (!numBtc || numBtc <= 0) {
      toast.error("Please enter a valid BTC amount to deposit");
      return;
    }

    // Per user requirement:
    // "once they click deposit the recipiant / investment wallet address is now copied to their dash board with also a generated qrcode for the receipant wallet adress in case of scan payment"
    navigator.clipboard.writeText(BTC_RECIPIENT_ADDRESS).then(() => {
      setCopied(true);
      toast.success(
        `Recipient wallet address copied! Send ${numBtc} BTC ($${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) to complete deposit.`,
        { duration: 5500 },
      );
    });

    setHasDeposited(true);
  };

  const handleConfirmTransfer = async () => {
    setIsSubmitting(true);
    try {
      // Call RPC to record pending transaction
      await supabase.rpc("submit_deposit", {
        p_btc_amount: numBtc,
        p_usd_amount: usdValue,
        p_wallet: BTC_RECIPIENT_ADDRESS,
      });

      toast.success("Deposit registered! Awaiting Bitcoin network confirmation (1-2 blocks).", {
        duration: 5000,
      });

      if (onDepositSubmitted) {
        onDepositSubmitted();
      }
      onClose();
    } catch (err: unknown) {
      console.warn("Failed to register deposit", err);
      toast.error("Failed to register deposit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setHasDeposited(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={resetAndClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden relative my-8"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-accent/20 via-accent/10 to-transparent p-5 border-b border-border relative">
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close deposit modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-accent/20 border border-accent/40 text-accent grid place-items-center font-bold text-xl shrink-0">
              ₿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground">Deposit Bitcoin (BTC)</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  Institutional Vault
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fund your cash balance for automated trading and active investment plans
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {planName && (
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent shrink-0" />
                <span>
                  Funding for: <strong className="text-foreground">{planName} Plan</strong>
                </span>
              </div>
              {initialUsdAmount && (
                <span className="font-mono font-bold text-accent">
                  ${initialUsdAmount.toLocaleString()} USD
                </span>
              )}
            </div>
          )}

          {/* Amount input block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Enter Exact BTC Amount to Deposit
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                1 BTC ≈ ${BTC_USD_PRICE.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="relative">
              <Input
                type="number"
                step="0.0001"
                min="0.001"
                value={btcAmount}
                onChange={(e) => {
                  setBtcAmount(e.target.value);
                  setHasDeposited(false);
                }}
                placeholder="0.05"
                className="text-lg font-mono font-bold pl-4 pr-24 py-6 rounded-2xl bg-background/80 border-border focus-visible:ring-accent"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 font-bold text-xs bg-muted px-2.5 py-1.5 rounded-lg text-foreground font-mono">
                <span>BTC</span>
              </div>
            </div>

            {/* USD Conversion preview */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-muted-foreground">Estimated Cash Balance credit:</span>
              <span className="font-bold font-mono text-accent text-sm">
                ≈ $
                {usdValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                USD
              </span>
            </div>

            {/* Quick BTC selection chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
              {[
                { btc: "0.0074", label: "0.0074 BTC (~$500 Starter)" },
                { btc: "0.05", label: "0.05 BTC" },
                { btc: "0.074", label: "0.074 BTC (~$5k Classic)" },
                { btc: "0.445", label: "0.445 BTC (~$30k Pro)" },
                { btc: "1.00", label: "1.00 BTC" },
                { btc: "1.482", label: "1.482 BTC (~$100k Exec)" },
              ].map((preset) => (
                <button
                  key={preset.btc}
                  type="button"
                  onClick={() => {
                    setBtcAmount(preset.btc);
                    setHasDeposited(false);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all font-mono ${
                    btcAmount === preset.btc
                      ? "border-accent bg-accent/15 text-accent font-bold"
                      : "border-border/70 hover:border-accent/40 bg-background/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Deposit Action Button */}
          {!hasDeposited ? (
            <Button
              onClick={handleDepositClick}
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-2xl py-6 text-sm shadow-md"
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Deposit {numBtc > 0 ? `${numBtc} BTC` : ""} & Generate Instructions
            </Button>
          ) : (
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 text-xs text-accent flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="h-4 w-4" /> Recipient wallet address copied to clipboard!
              </span>
              <button onClick={handleCopy} className="underline font-bold hover:text-accent/80">
                Copy again
              </button>
            </div>
          )}

          {/* Payment Instructions & Generated QR Code Section */}
          <AnimatePresence>
            {hasDeposited && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-2 border-t border-border"
              >
                <div className="text-center">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Scan or Copy Recipient Wallet Address
                  </span>
                </div>

                {/* Generated QR Code Card */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-background/60 border border-border">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-border/80">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Bitcoin Deposit QR Code"
                        className="w-52 h-52 object-contain"
                      />
                    ) : (
                      <div className="w-52 h-52 grid place-items-center text-muted-foreground">
                        <QrCode className="h-10 w-10 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                    <QrCode className="h-3.5 w-3.5 text-accent" />
                    <span>Scan with mobile wallet (Trust Wallet, Exodus, Coinbase, Cash App)</span>
                  </div>
                </div>

                {/* Recipient Wallet Address Box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-accent" />
                      Recipient / Investment Wallet Address:
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Network: Bitcoin (BTC)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-background/90 border border-accent/40 glow-accent">
                    <span className="font-mono text-xs md:text-sm break-all flex-1 text-foreground font-medium select-all">
                      {BTC_RECIPIENT_ADDRESS}
                    </span>
                    <Button
                      size="sm"
                      onClick={handleCopy}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 font-semibold text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Deposit Details summary */}
                <div className="rounded-xl border border-border/80 bg-background/40 p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exact Amount to Transfer:</span>
                    <span className="font-mono font-bold text-foreground">
                      {numBtc.toFixed(8)} BTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credited Cash Balance Value:</span>
                    <span className="font-mono font-bold text-accent">
                      $
                      {usdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Required Confirmations:</span>
                    <span className="text-muted-foreground font-mono">
                      1 confirmation (~10 mins)
                    </span>
                  </div>
                </div>

                {/* Confirm Action */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleConfirmTransfer}
                    disabled={isSubmitting}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-bold py-5 rounded-xl"
                  >
                    {isSubmitting
                      ? "Registering Deposit…"
                      : "I Have Sent Payment — Register Deposit"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetAndClose}
                    className="sm:w-28 py-5 rounded-xl text-xs"
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security note footer */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              <span>Multi-Signature Cold Storage Vault Protected</span>
            </div>
            <span className="font-mono">AES-256 TLS</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
